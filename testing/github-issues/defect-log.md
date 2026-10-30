# Vingo (QuickMart) — Defect Tracking & Bug Log

This document tracks all functional, security, and concurrency defects discovered during manual exploratory testing, API assertion suites, and Playwright automated E2E runs.

---

## 📊 Defect Severity Summary

| Defect ID | Title | Module | Severity | Status |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-101** | Race Condition on Simultaneous Order Claiming | Delivery Dispatch | 🔴 Critical | Fixed / Verified |
| **BUG-102** | Verification Documents Leaked in Non-Admin Profile Payload | Auth / Security | 🔴 Critical | Fixed / Verified |
| **BUG-103** | 4th Featured Product Limit Bypass via Concurrent Toggles | Vendor Catalog | 🟠 High | Fixed / Verified |
| **BUG-104** | Vendor State Machine Transition Bypass to Delivery Status | Orders Engine | 🟠 High | Fixed / Verified |
| **BUG-105** | Delivery Completion Permitted Without Customer OTP Validation | Delivery Lifecycle | 🟠 High | Fixed / Verified |
| **BUG-106** | Floating Cart Quantity Desynchronization on Rapid Clicks | Customer Cart | 🟡 Medium | Fixed / Verified |

---

## 🐞 Detailed Defect Reports

### Issue #BUG-101: Race Condition on Simultaneous Order Claiming
- **Module**: Delivery Partner Dispatch (`/api/delivery/accept/:orderId`)
- **Severity**: Critical (P0 Blocker)
- **Reporter**: QA Automation Team
- **Status**: Verified Fixed (Atomic `findOneAndUpdate` implemented)

#### 📝 Description
When two delivery partners located within the 20km radius view the same newly `READY` order and click "Accept Order" at the same sub-second window, both partners were originally assigned the exact same order due to a non-atomic `findOne` followed by `save()`.

#### 🔁 Steps to Reproduce
1. Seed an order in `READY` status with `deliveryPartner: null` and `deliveryStatus: "WAITING"`.
2. Open two separate browser sessions: Rider A (`rahul@delivery.com`) and Rider B (`bhavnagar@delivery.com`).
3. Send concurrent `POST /api/delivery/accept/:orderId` requests using Newman / Apache Bench concurrency test (`-n 2 -c 2`).

#### 🎯 Expected Result
The first request to obtain the database write lock succeeds with `200 OK`. The second concurrent request fails immediately with `409 Conflict`:
```json
{
  "success": false,
  "message": "Order has already been accepted by another delivery partner"
}
```

#### 💥 Actual Result (Before Fix)
Both requests succeeded with `200 OK`. The order document was overwritten, creating a duplicate active delivery for both partners and corrupting platform dispatch state.

#### 📸 Evidence & Network Log
```
Request 1 (Rider A) -> 200 OK | { orderId: "6a71...", deliveryPartner: "6a71_rahul" }
Request 2 (Rider B) -> 409 Conflict | { success: false, message: "Order has already been accepted..." }
```
```
[Database Concurrency Sequence Diagram]
Rider A ──POST /accept/:id──▶ [ Atomic findOneAndUpdate ] ──▶ Lock Acquired (200 OK)
Rider B ──POST /accept/:id──▶ [ Atomic findOneAndUpdate ] ──▶ Null returned -> 409 Conflict
```

---

### Issue #BUG-102: Verification Documents Leaked in Non-Admin Profile Payload
- **Module**: Auth & User Serialization (`formatUserResponse()`)
- **Severity**: Critical (P0 Security / Privacy)
- **Status**: Verified Fixed

#### 📝 Description
Delivery partner verification documents (`drivingLicense`, `vehicleRC`, `vehicleInsurance`, `aadhaarCard`, `panCard`) containing government IDs and sensitive personal ImageKit URLs were being returned in public user profiles and `/api/auth/test` for non-admin callers.

#### 🔁 Steps to Reproduce
1. Log in as a standard customer (`tasavvufg@gmail.com`).
2. Make a GET request to `/api/auth/test` with the customer's Bearer token.
3. Or query a delivery partner profile via order tracking endpoint `/api/orders/:orderId`.
4. Inspect the `deliveryPartnerProfile` object in the JSON response.

#### 🎯 Expected Result
Per invariant directive, uploaded documents MUST be visible **ONLY to administrators**. Non-admin requests must omit the `documents` object entirely:
```json
{
  "user": {
    "name": "Rahul Sharma",
    "deliveryPartnerProfile": {
      "vehicleType": "Motorcycle",
      "vehicleNumber": "GJ-03-AB-1234",
      "isVerified": true
    }
  }
}
```

#### 💥 Actual Result (Before Fix)
The full raw `documents` object was serialized in the API response:
```json
"documents": {
  "drivingLicense": { "url": "https://ik.imagekit.io/.../license_01.jpg" },
  "aadhaarCard": { "url": "https://ik.imagekit.io/.../aadhaar_01.jpg" }
}
```

---

### Issue #BUG-103: 4th Featured Product Limit Bypass via Concurrent Toggles
- **Module**: Vendor Inventory (`/api/vendor/products/:id/featured`)
- **Severity**: High (P1)
- **Status**: Verified Fixed

#### 📝 Description
The platform strictly limits each store to a **maximum of 3 featured products**. An automated boundary test discovered that sending concurrent PATCH toggle requests allowed vendors to mark 4 or 5 products as `featured: true`.

#### 🔁 Steps to Reproduce
1. Vendor has 2 featured products.
2. In the vendor dashboard, rapidly click "Featured" toggle on Product 3 and Product 4 almost simultaneously.
3. Or send asynchronous Postman batch requests for both products.

#### 🎯 Expected Result
The 3rd product is marked featured (`200 OK`). The 4th product toggle is rejected with `400 Bad Request`:
```json
{
  "success": false,
  "message": "Maximum 3 products can be featured per store"
}
```

#### 💥 Actual Result (Before Fix)
Both products were toggled to `featured: true` because the count query had not yet committed before the second update ran.

---

### Issue #BUG-104: Vendor State Machine Transition Bypass to Delivery Status
- **Module**: Vendor Orders State Machine (`/api/vendor/orders/:id/status`)
- **Severity**: High (P1)
- **Status**: Verified Fixed

#### 📝 Description
A vendor could theoretically send `{ status: "DELIVERED" }` or `{ status: "PICKED_UP" }` to the vendor order status endpoint, skipping the delivery partner lifecycle and forcing an order into completed state without physical pickup.

#### 🔁 Steps to Reproduce
1. Create and accept an order as vendor.
2. Using Postman, send `PATCH /api/vendor/orders/:orderId/status` with payload:
   ```json
   { "status": "DELIVERED" }
   ```

#### 🎯 Expected Result
Backend validates allowed vendor status transitions (`ACCEPTED`, `PREPARING`, `READY`, `REJECTED`). Returns `400 Bad Request` with message `Invalid vendor status transition. Vendor phase ends at READY.`

#### 💥 Actual Result (Before Fix)
Endpoint accepted any enum value defined in the Mongoose schema, updating the order to `DELIVERED` directly from the vendor console.

---

### Issue #BUG-105: Delivery Completion Permitted Without Customer OTP Validation
- **Module**: Delivery Partner State Machine (`/api/delivery/orders/:id/status`)
- **Severity**: High (P1)
- **Status**: Verified Fixed

#### 📝 Description
Delivery partners were able to transition orders from `OUT_FOR_DELIVERY` to `DELIVERED` without supplying the 4-digit verification OTP provided verbally by the customer upon handover.

#### 🔁 Steps to Reproduce
1. Log in as delivery partner with an active order in `OUT_FOR_DELIVERY`.
2. Send `PATCH /api/delivery/orders/:id/status` with `{ "status": "DELIVERED" }` (omitting `otp`).

#### 🎯 Expected Result
Backend returns HTTP `400 Bad Request`:
```json
{
  "success": false,
  "message": "Customer 4-digit delivery verification OTP is mandatory to complete delivery."
}
```

#### 💥 Actual Result (Before Fix)
Order was marked `DELIVERED` without verifying the customer OTP code, eliminating fraud protection against false delivery claims.

---

### Issue #BUG-106: Floating Cart Quantity Desynchronization on Rapid Clicks
- **Module**: Frontend Cart Context (`hybridCom/src/context/CartContext.jsx`)
- **Severity**: Medium (P2)
- **Status**: Verified Fixed

#### 📝 Description
Rapid clicking on the "+" button in product cards caused the React state total quantity to temporarily mismatch the backend cart database count due to non-debounced asynchronous network requests.

#### 🔁 Steps to Reproduce
1. On `/vendor/:vendorId`, rapidly triple-click the "+" button on a product card within 150ms.
2. Observe the badge count on `FloatingCart` vs the value on the `/cart` page.

#### 🎯 Expected Result
Optimistic state update accurately queues increments and debounces API synchronization, keeping floating cart and database count strictly aligned.

#### 💥 Actual Result (Before Fix)
Second click interrupted first dispatch, resulting in 2 items in database while floating cart UI rendered 3 items.

