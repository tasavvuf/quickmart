# Vingo (QuickMart) — Comprehensive Manual Test Cases (4-Role Delivery Platform)

> **Platform**: Vingo / QuickMart Hyperlocal Multi-Vendor Delivery System  
> **Roles Covered**: Customer (`user`), Vendor (`vendor`), Delivery Partner (`deliveryPartner`), Administrator (`admin`)  
> **Test Categories**: Positive (`POS`), Negative (`NEG`), Boundary (`BND`), Concurrency / Security (`SEC`)  
> **Total Test Cases**: 46 Cases  

---

## 📋 Test Suite Summary Matrix

| Module / Domain | Positive (POS) | Negative (NEG) | Boundary / Security (BND/SEC) | Total |
| :--- | :---: | :---: | :---: | :---: |
| **1. Authentication & Role Routing** | 4 | 4 | 2 | 10 |
| **2. Customer Flow (Discovery, Cart, Checkout)** | 4 | 4 | 3 | 11 |
| **3. Vendor Flow (Store, Inventory, Orders)** | 3 | 3 | 3 | 9 |
| **4. Delivery Partner Flow (Orders, Dispatch, Delivery)** | 3 | 3 | 3 | 9 |
| **5. Administrator Flow (Approvals, Privacy, Analytics)** | 3 | 2 | 2 | 7 |
| **Total Test Cases** | **17** | **16** | **13** | **46** |

---

## 🔐 1. Authentication & Role-Based Access Control (RBAC)

### TC-AUTH-01: Customer Registration with Valid Details & GPS
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: User is on `/signup`. Unique email & phone.
- **Steps**:
  1. Fill Name: "Aarav Patel", Phone: "9876500001", Username: "aarav_p", Email: "aarav@test.com", Password: "Password123!".
  2. Allow browser location access (Lat: 22.2842, Lng: 70.7963).
  3. Submit form.
- **Expected Result**: HTTP 201 Created. JWT token returned and stored in localStorage. Redirected to `/`. Welcome notification displayed.

### TC-AUTH-02: User Login with Valid Credentials (Role: Customer)
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: Account exists in MongoDB.
- **Steps**:
  1. Navigate to `/login`.
  2. Input valid username/email and password.
  3. Click "Sign In".
- **Expected Result**: HTTP 200 OK. Auth state persists, user redirected to home page, Nav bar displays customer profile and cart pill.

### TC-AUTH-03: Vendor Login & Redirect to Vendor Dashboard
- **Role**: Vendor (`vendor`)
- **Type**: Positive (`POS`)
- **Preconditions**: Registered vendor account exists.
- **Steps**:
  1. Navigate to `/vendor-login`.
  2. Enter vendor credentials and submit.
- **Expected Result**: Successfully logged in. App router detects `role === 'vendor'` and strictly routes to `/vendor-dashboard`.

### TC-AUTH-04: Delivery Partner Login & Redirect to Delivery Portal
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Positive (`POS`)
- **Preconditions**: Verified delivery partner credentials exist.
- **Steps**:
  1. Navigate to `/delivery/login`.
  2. Input delivery partner credentials and submit.
- **Expected Result**: Successfully logged in. App strictly renders `/delivery/dashboard` UI.

### TC-AUTH-05: Login with Wrong Password (401 Unauthorized)
- **Role**: Customer / All Roles
- **Type**: Negative (`NEG`)
- **Preconditions**: Valid username exists.
- **Steps**:
  1. Navigate to `/login`.
  2. Input valid username and invalid password "wrong_pass_999".
  3. Click "Sign In".
- **Expected Result**: HTTP 401 response from `/api/auth/login`. Toast error "Invalid email or password" displayed. User remains on login page.

### TC-AUTH-06: Customer Attempting to Access Vendor Dashboard (Strict RBAC Guard)
- **Role**: Customer (`user`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Logged in as customer.
- **Steps**:
  1. Manually type URL `http://localhost:5173/vendor-dashboard` in browser bar.
  2. Press Enter.
- **Expected Result**: Frontend route guard intercepts request: customer is immediately redirected to `/` home marketplace. Direct backend requests to `/api/vendor/*` return HTTP 403 Forbidden.

### TC-AUTH-07: Vendor Attempting to Access Delivery Portal (Strict RBAC Guard)
- **Role**: Vendor (`vendor`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Logged in as vendor.
- **Steps**:
  1. Manually type URL `http://localhost:5173/delivery/dashboard` in browser bar.
  2. Press Enter.
- **Expected Result**: Route guard catches non-delivery role and redirects to `/vendor-dashboard`. Backend `/api/delivery/*` calls return HTTP 403 Forbidden (`Access denied. Delivery partner role required`).

### TC-AUTH-08: Unauthenticated Access to Admin Control Console
- **Role**: Guest / Unauthenticated
- **Type**: Negative (`NEG`)
- **Preconditions**: No active session token.
- **Steps**:
  1. Manually navigate to `http://localhost:5173/admin/dashboard`.
- **Expected Result**: Redirected immediately to `/admin/login`. Direct API calls to `/api/admin/overview` return HTTP 401 Unauthorized (`Authentication token required`).

### TC-AUTH-09: Document Privacy Constraint on Profile Endpoint (Security)
- **Role**: Customer & Vendor
- **Type**: Security (`SEC`)
- **Preconditions**: Delivery partner has uploaded License, RC, Insurance, Aadhaar, PAN.
- **Steps**:
  1. Send `GET /api/auth/test` or `GET /api/stores/:id` using Customer or Vendor JWT token.
  2. Inspect response JSON payload.
- **Expected Result**: `documents` field (`drivingLicense`, `vehicleRC`, `aadhaarCard`, `panCard`) is strictly stripped by `formatUserResponse()` for all non-admin roles.

### TC-AUTH-10: Token Expiration & Tampered Token Handling
- **Role**: All Roles
- **Type**: Boundary (`BND`)
- **Preconditions**: User session token set in localStorage.
- **Steps**:
  1. Manually edit `accessToken` in localStorage to an invalid string `Bearer eyJhbGciOi...corrupted`.
  2. Refresh the page or trigger an API request.
- **Expected Result**: Backend returns HTTP 401 (`Invalid or expired token`). Frontend intercepts 401, clears localStorage, and redirects user to login.

---

## 🛒 2. Customer Flow (Discovery, Cart, Checkout, Order Tracking)

### TC-CUST-01: Geo-Location Vendor Discovery within Area
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: Active stores seeded with coordinates in Rajkot (22.2842, 70.7963).
- **Steps**:
  1. Open homepage `/` with location set to Rajkot.
  2. Observe list of available stores.
- **Expected Result**: Nearby open and admin-verified stores are displayed with distance badges, category tags, and rating scores.

### TC-CUST-02: Add Product to Cart & Update Quantity
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: Logged in as customer. Viewing an open store catalog.
- **Steps**:
  1. Click "Add" button on "Amul Butter 500g" (Price: ₹275).
  2. Verify floating cart pill appears showing `1 item | ₹275`.
  3. Click "+" button on product card.
- **Expected Result**: Quantity increments to 2. Floating cart and Cart page update total to `2 items | ₹550`.

### TC-CUST-03: Cart Checkout with Cash on Delivery (COD)
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: Cart has 1+ items from open store within 10km. Valid saved address selected.
- **Steps**:
  1. Navigate to `/cart`.
  2. Verify order breakdown: Subtotal, Delivery Fee, Taxes, Grand Total.
  3. Select payment method: "Cash on Delivery (COD)".
  4. Click "Proceed to Checkout".
- **Expected Result**: HTTP 200/201 response from `/api/cart/checkout`. Cart is cleared. User is instantly navigated to `/orders/:orderId`. Order status starts at `PENDING`.

### TC-CUST-04: Real-time Live Order Tracking Status Progress
- **Role**: Customer (`user`)
- **Type**: Positive (`POS`)
- **Preconditions**: Order placed (`/orders/:orderId`).
- **Steps**:
  1. Stay on `/orders/:orderId` live tracking screen.
  2. Vendor accepts and prepares order.
- **Expected Result**: Live tracking stepper reflects state transitions: `Order Confirmed` → `Store Preparing` → `Ready for Pickup`. When delivery partner accepts, rider details (name, phone) appear.

### TC-CUST-05: Unauthenticated Add-to-Cart Redirection Guard
- **Role**: Guest / Unauthenticated
- **Type**: Negative (`NEG`)
- **Preconditions**: Logged out.
- **Steps**:
  1. Open store page `/vendor/:vendorId`.
  2. Click "Add to Cart" on any product.
- **Expected Result**: Action is gated. Toast notification: "Please login to add items to your cart and place orders". User is redirected to `/login?redirect=/vendor/:vendorId`.

### TC-CUST-06: Checkout Attempt with Empty Cart (400 Bad Request)
- **Role**: Customer (`user`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Cart is empty (`items: []`).
- **Steps**:
  1. Direct POST request or UI click on checkout when cart is empty.
- **Expected Result**: UI blocks action with disabled button or toast error "Cart is empty". Backend `/api/cart/checkout` returns HTTP 400 Bad Request `{ success: false, message: "Cart is empty" }`.

### TC-CUST-07: Checkout from Currently Closed Store
- **Role**: Customer (`user`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Store has `isOpen: false`. Items previously placed in cart.
- **Steps**:
  1. Proceed to `/cart`.
  2. Attempt to click "Proceed to Checkout".
- **Expected Result**: Blocked by checkout guard. Toast message: `Store "<Name>" is currently closed. Orders cannot be placed right now.` Backend returns HTTP 400 Bad Request.

### TC-CUST-08: Checkout Exceeding Customer-Store Distance Threshold (>10km)
- **Role**: Customer (`user`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Customer selects delivery address > 10km away from store.
- **Steps**:
  1. Select delivery address with coordinates 15km away from the active store.
  2. Attempt to click "Proceed to Checkout".
- **Expected Result**: UI blocks checkout: `Delivery address is 15km away. Orders are strictly limited to within 10km of "<Store>"`.

### TC-CUST-09: Product Stock Upper Boundary Enforcement
- **Role**: Customer (`user`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Product stock is set to exactly 5 units in MongoDB.
- **Steps**:
  1. Add product to cart.
  2. Click "+" button until quantity reaches 5.
  3. Attempt to click "+" a 6th time.
- **Expected Result**: Button disables or toast notifies "Maximum available stock reached (5)". Cannot increment beyond physical stock.

### TC-CUST-10: Cart Item Decrement to Zero (Auto-Removal)
- **Role**: Customer (`user`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Item in cart with quantity = 1.
- **Steps**:
  1. On `/cart`, click "-" button on the item.
- **Expected Result**: Item is completely removed from cart array. Cart total decrements. If cart is now empty, empty cart placeholder graphic appears.

### TC-CUST-11: Out-of-Coverage Area Wishlist Registration
- **Role**: Customer (`user`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Customer coordinates detected in unsupported zone (no stores within 20km).
- **Steps**:
  1. App renders `LocationUnavailableNotice.jsx`.
  2. Enter email "future_shopper@gmail.com".
  3. Click "Notify Me When Available".
- **Expected Result**: `POST /api/wishlist` returns HTTP 201 Created. Success message: "You've been added to our area expansion wishlist!". Record saved with coordinates in DB.

---

## 🏪 3. Vendor Flow (Store, Inventory, Order State Machine)

### TC-VEND-01: Vendor Dashboard Metrics & Order Queue View
- **Role**: Vendor (`vendor`)
- **Type**: Positive (`POS`)
- **Preconditions**: Vendor logged in. Orders have been placed by customers.
- **Steps**:
  1. Navigate to `/vendor-dashboard`.
  2. Observe Overview and Orders tabs.
- **Expected Result**: Summary tiles display Total Sales, Active Orders, and Store Status. Orders tab displays incoming orders with customer item snapshot and timers.

### TC-VEND-02: Vendor Order State Machine: PENDING → ACCEPTED → PREPARING → READY
- **Role**: Vendor (`vendor`)
- **Type**: Positive (`POS`)
- **Preconditions**: Incoming customer order in `PENDING` status.
- **Steps**:
  1. Click "Accept Order" -> verifies `PATCH /api/vendor/orders/:id/status` with `{ status: "ACCEPTED" }`.
  2. Click "Start Preparing" -> verifies `{ status: "PREPARING" }`.
  3. Click "Mark Ready for Pickup" -> verifies `{ status: "READY" }`.
- **Expected Result**: Status updates successfully on each transition. Vendor phase halts at `READY`. Order enters delivery pool (`deliveryStatus: "WAITING"`).

### TC-VEND-03: Toggle Featured Product (Within 3-Product Limit)
- **Role**: Vendor (`vendor`)
- **Type**: Positive (`POS`)
- **Preconditions**: Store currently has 2 products marked as `featured: true`.
- **Steps**:
  1. Navigate to Products tab.
  2. Find unfeatured product "Organic Green Tea".
  3. Toggle "Featured" switch ON.
- **Expected Result**: HTTP 200 OK. Star badge activates. Store now has 3 featured products.

### TC-VEND-04: Strict 4th Featured Product Limit Guard (Boundary / Negative)
- **Role**: Vendor (`vendor`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Store currently has exactly 3 products with `featured: true`.
- **Steps**:
  1. Find a 4th product in the inventory.
  2. Attempt to toggle "Featured" switch ON.
- **Expected Result**: Request rejected! Backend returns HTTP 400 Bad Request with message `Maximum 3 products can be featured per store`. Frontend shows error toast and keeps switch OFF.

### TC-VEND-05: Vendor Attempting to Transition Beyond READY (Illegal Transition)
- **Role**: Vendor (`vendor`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Order is in `READY` status.
- **Steps**:
  1. Vendor attempts to send direct PATCH request `{ status: "DELIVERED" }` or `{ status: "PICKED_UP" }` to `/api/vendor/orders/:id/status`.
- **Expected Result**: HTTP 400 Bad Request. Vendor cannot alter delivery phases. State machine boundary is strictly enforced.

### TC-VEND-06: Vendor Rejecting Order (Stock Restoration & Socket Broadcast)
- **Role**: Vendor (`vendor`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Order in `PENDING` status.
- **Steps**:
  1. Vendor clicks "Reject Order" with reason "Out of Stock".
- **Expected Result**: Order transitions to `REJECTED`. `deliveryStatus` set to `CANCELLED`. Product stock quantities in database are restored. Order removed from available delivery pool.

### TC-VEND-07: Unauthenticated or Customer Role Access to Vendor Routes
- **Role**: Customer (`user`) / Guest
- **Type**: Negative (`NEG`)
- **Preconditions**: Authenticated with customer token.
- **Steps**:
  1. Execute `GET /api/vendor/dashboard`.
  2. Execute `PATCH /api/vendor/orders/123/status`.
- **Expected Result**: HTTP 403 Forbidden with `{ message: "Access denied. Vendor role required." }`.

### TC-VEND-08: Add Product with Zero or Negative Price (Validation Boundary)
- **Role**: Vendor (`vendor`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Vendor on "Add Product" modal.
- **Steps**:
  1. Enter Name: "Invalid Item", Price: -50, Stock: 10.
  2. Click "Save Product".
- **Expected Result**: Form validation blocks submission. Backend schema validation returns HTTP 400 (`Price must be a positive number greater than 0`).

### TC-VEND-09: Add Product with Negative Stock
- **Role**: Vendor (`vendor`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Vendor creating product.
- **Steps**:
  1. Enter Stock: -5.
  2. Click "Save Product".
- **Expected Result**: Validation error. Stock must be an integer >= 0.

---

## 🚴 4. Delivery Partner Flow (Dispatch, State Machine, Concurrency)

### TC-DELV-01: Available Orders Filtered by 20km Haversine Geo-Radius
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Positive (`POS`)
- **Preconditions**: Delivery partner located at (22.2860, 70.7920). Store A is 3.5km away (status: READY). Store B is 28km away (status: READY).
- **Steps**:
  1. Delivery partner navigates to `/delivery/dashboard`.
  2. Calls `GET /api/delivery/available-orders`.
- **Expected Result**: Store A's order is returned with `distanceToStore: 3.5 km`. Store B's order is strictly excluded by the 20km Haversine filter.

### TC-DELV-02: Atomic Order Acceptance (`findOneAndUpdate` Concurrency Lock)
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Positive (`POS`)
- **Preconditions**: An order is in `READY` status with `deliveryPartner: null` and `deliveryStatus: "WAITING"`.
- **Steps**:
  1. Partner clicks "Accept Delivery" button (`POST /api/delivery/accept/:orderId`).
- **Expected Result**: HTTP 200 OK. Atomic lock sets `deliveryPartner: partnerId`, `deliveryStatus: "ASSIGNED"`, `assignedAt: timestamp`. Order moves to "Active Delivery" view.

### TC-DELV-03: Order Delivery Lifecycle: ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Positive (`POS`)
- **Preconditions**: Order claimed by partner.
- **Steps**:
  1. Click "Confirm Pickup at Store" -> `PATCH /api/delivery/orders/:id/status` `{ status: "PICKED_UP" }`.
  2. Click "Start Delivery" -> `{ status: "OUT_FOR_DELIVERY" }`.
  3. Enter valid 4-digit customer delivery OTP (e.g. "4829") and click "Complete Delivery".
- **Expected Result**: Order transitions successfully through all phases. On `DELIVERED`, order is marked completed, and stats increment.

### TC-DELV-04: Concurrent Acceptance Conflict (Race Condition / 409 Conflict)
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Concurrency (`SEC`)
- **Preconditions**: Order #ORD-101 is available. Rider A and Rider B attempt to click "Accept" simultaneously.
- **Steps**:
  1. Rider A request reaches MongoDB first: `deliveryPartner` claimed.
  2. Rider B request executes atomic query `{ _id: id, deliveryPartner: null }`.
- **Expected Result**: Query returns `null` for Rider B. Backend throws HTTP 409 Conflict `{ success: false, message: "Order has already been accepted by another delivery partner" }`. Rider B UI refreshes available list.

### TC-DELV-05: Complete Delivery Without OTP or with Wrong OTP (400 Bad Request)
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Order is in `OUT_FOR_DELIVERY` status. Actual OTP is "4829".
- **Steps**:
  1. Case A: Submit `{ status: "DELIVERED" }` with no OTP.
  2. Case B: Submit `{ status: "DELIVERED", otp: "0000" }` (incorrect OTP).
- **Expected Result**: Both attempts return HTTP 400 Bad Request with message `Invalid or missing delivery verification OTP`. Order status remains `OUT_FOR_DELIVERY`.

### TC-DELV-06: Delivery Partner Accessing Vendor Dashboard (Forbidden)
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Logged in as delivery partner.
- **Steps**:
  1. Navigate to `/vendor-dashboard`.
- **Expected Result**: Route guard catches role mismatch and redirects to `/delivery/dashboard`. API `/api/vendor/*` returns 403 Forbidden.

### TC-DELV-07: Delivery Partner Accepting Already Assigned or Cancelled Order
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Negative (`NEG`)
- **Preconditions**: Order is `CANCELLED` due to vendor rejection.
- **Steps**:
  1. Attempt `POST /api/delivery/accept/:orderId`.
- **Expected Result**: HTTP 409 Conflict or 400 Bad Request (`Order is not available for delivery`).

### TC-DELV-08: Store Distance Boundary Test (20.0 km vs 20.1 km)
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Store A distance = 19.99 km. Store B distance = 20.05 km.
- **Steps**:
  1. Execute `GET /api/delivery/available-orders`.
- **Expected Result**: Store A order is included in array. Store B order is excluded. Exact 20km boundary respected.

### TC-DELV-09: Unverified Delivery Partner Account Restriction
- **Role**: Delivery Partner (`deliveryPartner`)
- **Type**: Boundary (`BND`)
- **Preconditions**: Newly registered delivery partner with `isVerified: false`.
- **Steps**:
  1. Attempt to fetch available orders or accept an order.
- **Expected Result**: UI displays "Account Pending Admin Verification" banner. System prevents order acceptance until admin approves verification documents.

---

## 🛡️ 5. Administrator Flow (Approvals, Document Privacy, Oversight)

### TC-ADMN-01: Admin Console Overview & Platform KPIs
- **Role**: Administrator (`admin`)
- **Type**: Positive (`POS`)
- **Preconditions**: Admin user logged in (`admin@ecom.com`).
- **Steps**:
  1. Navigate to `/admin/dashboard`.
  2. View Overview tab.
- **Expected Result**: Platform KPIs loaded: Total Revenue, Total Orders, Active Stores, Pending Store Approvals, Active Delivery Partners, and Live Order Feed.

### TC-ADMN-02: Review Delivery Partner Documents & Approve Rider Verification
- **Role**: Administrator (`admin`)
- **Type**: Positive (`POS`)
- **Preconditions**: Rider registered with driving license and RC uploaded.
- **Steps**:
  1. Go to Delivery Partners tab.
  2. Click on pending rider. View unredacted ImageKit document URLs.
  3. Click "Verify Partner" (`PATCH /api/admin/delivery-partners/:id/verify` with `{ isVerified: true }`).
- **Expected Result**: HTTP 200 OK. Rider status changes to "Verified". Rider is now eligible to receive orders.

### TC-ADMN-03: Store Verification & Approval Workflow
- **Role**: Administrator (`admin`)
- **Type**: Positive (`POS`)
- **Preconditions**: New vendor registered store (`isVerifiedByAdmin: false`).
- **Steps**:
  1. Go to Stores tab -> Filter "Pending Approval".
  2. Inspect store GST number, address, and photo.
  3. Click "Approve Store" (`PATCH /api/admin/stores/:id/verify` with `{ isApproved: true }`).
- **Expected Result**: Store `isVerifiedByAdmin` set to `true`. Store immediately becomes visible in customer search and catalog.

### TC-ADMN-04: Non-Admin Role Attempting Admin Operations (403 Forbidden)
- **Role**: Customer (`user`) / Vendor (`vendor`) / Delivery Partner
- **Type**: Negative (`NEG`)
- **Preconditions**: Authenticated with non-admin token.
- **Steps**:
  1. Send request `GET /api/admin/overview`.
  2. Send request `PATCH /api/admin/stores/:id/verify`.
- **Expected Result**: HTTP 403 Forbidden `{ success: false, message: "Access denied. Admin role required." }`.

### TC-ADMN-05: Unauthenticated Admin Endpoint Access (401 Unauthorized)
- **Role**: Guest
- **Type**: Negative (`NEG`)
- **Preconditions**: No Authorization header sent.
- **Steps**:
  1. Send `GET /api/admin/delivery-partners`.
- **Expected Result**: HTTP 401 Unauthorized. Access rejected.

### TC-ADMN-06: Inspect Cross-Store Platform Orders Stream with Delivery OTP
- **Role**: Administrator (`admin`)
- **Type**: Security (`SEC`)
- **Preconditions**: Active orders placed across multiple stores.
- **Steps**:
  1. Navigate to Admin Orders tab.
  2. Inspect order details.
- **Expected Result**: Admin sees complete audit trail: Store info, Customer phone/address, Delivery Partner vehicle profile, and the active `deliveryOtp` for dispute resolution.

### TC-ADMN-07: Area Expansion Wishlist Geographic Density Review
- **Role**: Administrator (`admin`)
- **Type**: Boundary (`BND`)
- **Preconditions**: 10+ customers in unsupported zones submitted wishlist requests.
- **Steps**:
  1. Navigate to Wishlist tab (`GET /api/wishlist`).
- **Expected Result**: Returns subscriber list, total count, and GeoJSON coordinates to evaluate next warehouse/store launch locations.

