# AI Agent System Instructions & Codebase Guidelines

Welcome, AI Agent! You are working on **QuickMart**, a production-grade hyperlocal multi-vendor e-commerce and delivery platform.

---

## 🚨 MANDATORY AGENT DIRECTIVES

Before modifying, debugging, or extending any part of this codebase, you **MUST** follow these rules:

### 1. Read All Primary Documentation First
Before writing code or answering structural questions, inspect these authoritative documentation files:
- 📖 [**`README.md`**](file:///home/tasavvuf/500GB_Drive/Projects/Web_Dev/ecom-final/README.md) — High-level architecture, tech stack, and setup commands.
- 📐 [**`docs/ARCHITECTURE.md`**](file:///home/tasavvuf/500GB_Drive/Projects/Web_Dev/ecom-final/docs/ARCHITECTURE.md) — Detailed state machines, 20km Haversine engine, atomic concurrency locks, and Mongoose database schemas.
- 📡 [**`docs/API_DOCUMENTATION.md`**](file:///home/tasavvuf/500GB_Drive/Projects/Web_Dev/ecom-final/docs/API_DOCUMENTATION.md) — REST API endpoint specs, payloads, and response structures.

---

## 🛡️ Business Rules & Invariants

You MUST strictly enforce the following rules without exception:

### 1. Role-Based Access Control & Strict Routing
- QuickMart has 4 roles: `user`, `vendor`, `deliveryPartner`, and `admin`.
- Vendors are restricted to `/vendor-dashboard` and vendor APIs (`verifyVendor` middleware).
- Delivery partners are restricted to `/delivery/dashboard` and delivery APIs (`verifyDeliveryPartner` middleware).
- Customers access the store marketplace, cart, and live order tracking (`/orders/:orderId`).

### 2. Featured Product Rule
- **Rule**: Exactly **maximum 3 products** per vendor store can be marked as `isFeatured: true`.
- If a vendor attempts to feature a 4th product, the backend and frontend MUST block it with an informative message.

### 3. Document Privacy Constraint
- Verification documents (`drivingLicense`, `vehicleRC`, `vehicleInsurance`, `aadhaarCard`, `panCard`) uploaded by delivery partners are encrypted & stored via ImageKit.
- **Privacy Rule**: Document fields are visible **ONLY to admin users**. `formatUserResponse()` in `auth.controller.js` MUST strip the `documents` object for non-admin users.

### 4. Dual Order State Machine Handoff
Order statuses follow two synced fields (`vendorStatus` and `deliveryStatus`):
- **Vendor Phase**: `PENDING` → `ACCEPTED` → `PREPARING` → `READY`.
- *Vendor status transitions STOP at `READY`.*
- **Delivery Phase**: When `vendorStatus === "READY"` and `deliveryStatus === "WAITING"`, the order enters the delivery pool.
- **Delivery Partner Phase**: `ASSIGNED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`.
- Never bypass or skip state machine transitions.

### 5. Atomic Order Acceptance & Concurrency
- When a delivery partner accepts an order, the query MUST use atomic locks:
  ```javascript
  Order.findOneAndUpdate(
    { _id: orderId, deliveryPartner: null, deliveryStatus: "WAITING", vendorStatus: "READY" },
    { $set: { deliveryPartner: partnerId, deliveryStatus: "ASSIGNED", assignedAt: new Date() } },
    { new: true }
  )
  ```
- If `null` is returned, throw a `409 Conflict` error indicating another partner has claimed the order.

### 6. 20km Geo-Radius Limitation
- Available orders for delivery partners are filtered using the **Haversine formula**.
- Orders where the store is **>20km** from the delivery partner's GPS location MUST NOT be displayed.

---

## 🎨 UI & Design Aesthetics

- **Framework**: Use Vanilla CSS / Tailwind CSS with sleek dark/light mode themes, glassmorphism (`backdrop-blur`), and vibrant accent colors (Amber/Yellow/Emerald).
- **Typography & Icons**: Modern typography with Lucide icons.
- **Readability**: High contrast font sizes, clean badge styling, no excessive emojis, no unstyled default inputs.

---

## 🛠️ Code Verification Workflow

When making code edits:
1. Ensure both backend and frontend compile cleanly without errors.
2. Verify database changes using `seeder.js` if model schemas change.
3. Test frontend using `npm run build` in `hybridCom`.
