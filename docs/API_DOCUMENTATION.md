# QuickMart — REST API Reference

Base API URL: `http://localhost:5000/api`

---

## 🔐 1. Authentication & Users (`/api/auth`)

### `POST /api/auth/reg`
Registers a Customer (`user`) or Vendor (`vendor`). Accepts `multipart/form-data`.
- **Payload**:
  - `name`, `phoneNumber`, `userName`, `email`, `password`, `role` (`"user"` \| `"vendor"`)
  - `location`: JSON string `{ lat: number, lng: number }`
  - `profilePhoto` (File, optional)
  - If `role === "vendor"`: `store` object + `storePhoto` file required.
- **Response**: `{ user, token }`

### `POST /api/auth/reg/delivery`
Registers a Delivery Partner (`deliveryPartner`). Accepts `multipart/form-data`.
- **Payload**:
  - `name`, `phoneNumber`, `userName`, `email`, `password`, `role: "deliveryPartner"`
  - `location`: JSON string `{ lat: number, lng: number }`
  - `deliveryPartnerProfile`: JSON string containing vehicle & personal info.
  - Documents (Files): `profilePhoto`, `drivingLicense`, `vehicleRC`, `vehicleInsurance`, `aadhaarCard`, `panCard`.
- **Response**: `{ user, token }`

### `POST /api/auth/login`
Authenticates any user role.
- **Payload**: `{ email, userName, password, role }`
- **Response**: `{ user, token }`

### `GET /api/auth/test`
Validates JWT token and returns user profile. `Authorization: Bearer <token>`.

### `GET /api/auth/logout`
Clears session token.

---

## 🏪 2. Public Store & Catalog (`/api/stores`)

### `GET /api/stores`
Returns list of active stores. Optional query params: `lat`, `lng`, `radius` (km).

### `GET /api/stores/:storeId`
Returns detailed store profile and product catalog.

### `GET /api/stores/:storeId/featured`
Returns up to 3 featured products for the specified store.

---

## 🛒 3. Cart Operations (`/api/cart`)

### `GET /api/cart`
Gets current user's cart contents and calculated totals.

### `POST /api/cart/items`
Adds an item to the cart.
- **Payload**: `{ productId, quantity }`

### `PATCH /api/cart/items/:productId`
Updates item quantity.

### `DELETE /api/cart/items/:productId`
Removes an item from the cart.

---

## 📦 4. Customer Orders (`/api/orders`)

### `POST /api/orders`
Places an order from the active cart.
- **Payload**: `{ deliveryAddress, paymentType: "COD" | "UPI" }`
- **Response**: `{ success: true, order: { _id, ... } }`

### `GET /api/orders`
Gets all orders placed by the authenticated customer.

### `GET /api/orders/:orderId`
Gets live order tracking details for `/orders/:orderId`. Includes store details, items snapshot, payment status, and populated `deliveryPartner` (name, phone) when assigned.

---

## 🏬 5. Vendor Management (`/api/vendor`)

*Requires `Authorization: Bearer <token>` and `role === "vendor"`.*

### `GET /api/vendor/dashboard`
Returns vendor dashboard summary (total sales, pending orders count, store info).

### `GET /api/vendor/orders`
Returns vendor order history with filter options (`ALL`, `PENDING`, `ACCEPTED`, `PREPARING`, `READY`, etc.).

### `PATCH /api/vendor/orders/:orderId/status`
Advances vendor order status.
- **Payload**: `{ status: "ACCEPTED" | "PREPARING" | "READY" | "REJECTED" }`

### `GET /api/vendor/products`
Lists store products.

### `POST /api/vendor/products`
Creates a new product.

### `PATCH /api/vendor/products/:productId/featured`
Toggles featured status. Enforces the strict **max 3 featured products** limit per store.

---

## 🚴 6. Delivery Partner Portal (`/api/delivery`)

*Requires `Authorization: Bearer <token>` and `role === "deliveryPartner"`.*

### `GET /api/delivery/dashboard`
Returns delivery partner dashboard stats (total completed deliveries, availability, current active order).

### `GET /api/delivery/available-orders`
Returns all orders in `READY` status from stores **within 20km radius** of partner's GPS location. Enriched with `distanceToStore` and `storeToCustomerDistance`.

### `POST /api/delivery/accept/:orderId`
Atomically claims an available order.
- Returns `200 OK` with order object on success.
- Returns `409 Conflict` if order was already accepted by another partner.

### `GET /api/delivery/active`
Returns current active delivery order for the partner.

### `PATCH /api/delivery/orders/:orderId/status`
Advances delivery status.
- **Payload**: `{ status: "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED", otp?: "4829" }`
- **Note**: When `status === "DELIVERED"`, the 4-digit `otp` provided verbally by the customer is **mandatory**. If `otp` is missing or incorrect, returns `400 Bad Request`.

### `GET /api/delivery/my-orders`
Returns partner's completed delivery history.
