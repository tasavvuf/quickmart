# QuickMart — System Architecture & Technical Specifications

This document outlines the architecture, database schemas, state machines, geospatial calculations, and security principles of QuickMart.

---

## 1. System Overview & User Roles

QuickMart supports four distinct user roles:

```
                  ┌─────────────────────────────────────────┐
                  │               QuickMart                 │
                  └────────────────────┬────────────────────┘
                                       │
         ┌──────────────────┬──────────┴───────────┬──────────────────┐
         │                  │                      │                  │
 ┌───────▼──────┐   ┌───────▼──────┐       ┌───────▼──────┐   ┌───────▼──────┐
 │ Customer     │   │ Vendor       │       │ Delivery     │   │ Admin        │
 │ (user)       │   │ (vendor)     │       │ Partner      │   │ (admin)      │
 └──────────────┘   └──────────────┘       └──────────────┘   └──────────────┘
```

1. **Customer (`user`)**:
   - Discovers nearby stores and items.
   - Places real orders (COD / UPI).
   - Tracks live order status changes on `/orders/:orderId`.
2. **Vendor (`vendor`)**:
   - Manages store profile, business info, and store photo.
   - Manages product catalog (maximum 3 featured products per store).
   - Accepts orders and advances vendor status (`PENDING` → `ACCEPTED` → `PREPARING` → `READY`).
3. **Delivery Partner (`deliveryPartner`)**:
   - Registers via 4-step wizard with GPS location and document uploads.
   - Views orders in `READY` status within a 20km Haversine distance radius.
   - Atomically claims orders (`findOneAndUpdate`).
   - Advances delivery status (`ASSIGNED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`).
4. **Admin (`admin`)**:
   - Accesses hidden Admin Console (`/admin/login` & `/admin/dashboard`). Not visible in navbar.
   - Protected by `verifyAdmin` middleware on backend (`req.user.role === "admin"`). `user`, `vendor`, and `deliveryPartner` accounts are rejected with `403 Forbidden`.
   - **Superclean Monochrome Styling**: Designed strictly for Admin views using `#fbfbfb` background, `#363537` primary text, and `Satoshi, 'Satoshi Fallback', sans-serif` font system.
   - Manages store approvals (`isVerifiedByAdmin: true`) and vendor listings.
   - Inspects unredacted ImageKit verification documents (Driving License, RC, Insurance, Aadhaar, PAN) and approves delivery partners.
   - Monitors real-time cross-store platform order streams and system revenue analytics.

---

## 2. Order Lifecycle & Dual State Machine

Orders are governed by a synchronized state machine with strict vendor and delivery partner boundaries.

### State Diagram

```
[Customer Checkout]
        │
        ▼
   vendorStatus: PENDING ──(Vendor Rejects)──► vendorStatus: REJECTED (Stock Restored)
        │
  (Vendor Accepts)
        │
        ▼
   vendorStatus: ACCEPTED
        │
 (Vendor Prepares)
        │
        ▼
   vendorStatus: PREPARING
        │
   (Vendor Ready)
        │
        ▼
   vendorStatus: READY  ───► deliveryStatus: WAITING (Available to partners within 20km)
                                      │
                         (Partner Claims - Atomic)
                                      │
                                      ▼
                             deliveryStatus: ASSIGNED (assignedAt)
                                      │
                         (Partner Picked Up)
                                      │
                                      ▼
   vendorStatus: PICKED_UP ◄─ deliveryStatus: PICKED_UP (pickedUpAt)
                                      │
                       (Partner Out for Delivery)
                                      │
                                      ▼
vendorStatus: OUT_FOR_DELIVERY ◄─ deliveryStatus: OUT_FOR_DELIVERY
                                      │
                             (Partner Delivered)
                                      │
                                      ▼
    vendorStatus: DELIVERED ◄─ deliveryStatus: DELIVERED (deliveredAt)
                                                         (COD → paymentStatus: PAID)
```

### State Machine Transition Rules

| Role | Allowed Transitions |
| :--- | :--- |
| **Vendor** | `PENDING` → `["ACCEPTED", "REJECTED"]`<br>`ACCEPTED` → `["PREPARING"]`<br>`PREPARING` → `["READY"]`<br>*Responsibility strictly ends at READY. Vendors cannot transition past READY.* |
| **Delivery Partner** | `ASSIGNED` → `["PICKED_UP"]`<br>`PICKED_UP` → `["OUT_FOR_DELIVERY"]`<br>`OUT_FOR_DELIVERY` → `["DELIVERED"]` *(Requires customer 4-digit OTP)* |

### 🔒 4-Digit Delivery OTP Security Rule
- **Generation**: Each order auto-generates a 4-digit numeric OTP (`deliveryOtp`) upon creation.
- **Privacy & Hidden Projection**: Saved with `deliveryOtp: { type: String, select: false }` in MongoDB. Excluded from vendor, delivery partner, and aggregation query projections.
- **Customer Exclusivity**: Visible ONLY to the customer who placed the order when fetching `/api/orders/:orderId`.
- **Verification**: Transition to `DELIVERED` requires the delivery partner to enter the customer's 4-digit PIN (`PATCH /api/delivery/orders/:orderId/status` with `{ status: "DELIVERED", otp: "4829" }`). Failed OTPs return `400 Bad Request`.

---

## 3. Concurrency & Geospatial Technical Details

### ⚡ Atomic Order Acceptance (`findOneAndUpdate`)
To prevent two delivery partners from claiming the same order simultaneously:
```javascript
const order = await Order.findOneAndUpdate(
  {
    _id: orderId,
    deliveryPartner: null,     // Atomic lock condition
    deliveryStatus: "WAITING",
    vendorStatus: "READY"
  },
  {
    $set: {
      deliveryPartner: partnerId,
      deliveryStatus: "ASSIGNED",
      assignedAt: new Date()
    },
    $push: {
      statusHistory: {
        status: "ASSIGNED",
        updatedBy: "deliveryPartner",
        timestamp: new Date()
      }
    }
  },
  { new: true }
);

if (!order) {
  // Returns HTTP 409 Conflict ("Order already claimed by another partner")
}
```

### 📍 20km Haversine Geo-Radius Filtering
Available orders are filtered using the partner's location `[lng, lat]` and the store's location `[lng, lat]`:
$$\text{haversine}(c_1, c_2) = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
- Max radius constraint: `MAX_DELIVERY_RADIUS_KM = 20`.
- Orders outside 20km are automatically excluded from the delivery partner's feed.

---

## 4. Database Schemas

### `User` (`models/user.model.js`)
- `userName`, `name`, `phoneNumber`, `email`, `password`, `role` (`user` \| `admin` \| `vendor` \| `deliveryPartner`).
- `location`: GeoJSON `Point` (`coordinates: [lng, lat]`).
- `addresses`: Array of saved customer delivery addresses with individual GeoJSON points.
- `deliveryPartnerProfile`: Subdocument storing vehicle details, emergency contacts, availability, and ImageKit verification documents.

### `Store` (`models/Store.model.js`)
- `owner`: Reference to vendor `User._id`.
- `name`, `description`, `category`, `emergencyContact`, `address`, `storePhoto`.
- `location`: GeoJSON `Point` indexed with `2dsphere`.

### `Product` (`models/Product.model.js`)
- `store`: Reference to `Store._id`.
- `name`, `price`, `stock`, `isFeatured` (max 3 per store), `category`, `productImage`.

### `Order` (`models/Order.model.js`)
- `customer`: Reference to customer `User._id`.
- `store`: Reference to `Store._id`.
- `deliveryPartner`: Reference to delivery partner `User._id` (default `null`).
- `items`: Snapshot of products (`productId`, `productName`, `priceAtPurchase`, `quantity`, `subtotal`).
- `vendorStatus`, `deliveryStatus`, `paymentType` (`COD` \| `UPI`), `paymentStatus` (`PENDING` \| `PAID`).
- `statusHistory`: Timestamped audit trail of status changes.

---

## 5. Media Upload Pipeline (Multer + ImageKit)

1. Client posts `multipart/form-data` to Express endpoint.
2. `upload.middleware.js` processes memory storage buffer (`multer`).
3. `imagekit.service.js` streams buffer to ImageKit under designated folders:
   - Profile photos: `/HOME/profile-photos/`
   - Store photos: `/HOME/stores/`
   - Delivery partner documents: `/HOME/delivery-docs/{partnerId}/`
4. ImageKit returns URL, fileId, and thumbnailUrl stored in MongoDB.
