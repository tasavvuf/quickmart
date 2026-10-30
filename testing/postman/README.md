# Vingo (QuickMart) — Postman API Test Suite

This directory contains the automated REST API Postman Collection and Environment files for **Vingo (QuickMart)**.

---

## 📁 File Manifest

1. **`Vingo-API-Collection.postman_collection.json`**
   - 28+ test requests organized into 8 functional folders.
   - Comprehensive `pm.test()` assertions evaluating status codes (`200`, `201`, `400`, `401`, `403`, `409`), response times, schema structures, and data integrity.
   - Dynamic chaining: automatically extracts and propagates `customerToken`, `vendorToken`, `deliveryToken`, `adminToken`, `storeId`, `productId`, `orderId`, and `deliveryOtp`.

2. **`Vingo-Local.postman_environment.json`**
   - Configured with default base URL `http://localhost:5000/api`.
   - Seeded test credentials for all 4 roles.
   - Default geo-coordinates (Rajkot: `22.2842`, `70.7963`).

---

## 🚀 Execution Instructions

### Option A: Using Postman Desktop or Web App
1. Open Postman.
2. Click **Import** (top left).
3. Drag & drop both `Vingo-API-Collection.postman_collection.json` and `Vingo-Local.postman_environment.json`.
4. In the top right environment dropdown, select **Vingo Local Environment**.
5. Click on the collection name and click **Run Collection**.
6. Ensure the order of folders:
   - `01_Auth`
   - `02_Stores_Catalog`
   - `03_Cart_Operations`
   - `04_Order_Creation_Checkout`
   - `05_Vendor_State_Machine`
   - `06_Delivery_Partner_Flow`
   - `07_Admin_Console_RBAC`
   - `08_Wishlist_Coverage`
7. Click **Run Vingo (QuickMart) API Test Suite**.

### Option B: Running Headless via Newman CLI
You can execute the entire test suite from terminal using [Newman](https://www.npmjs.com/package/newman):

```bash
# Run with CLI reporter
npx newman run testing/postman/Vingo-API-Collection.postman_collection.json \
  -e testing/postman/Vingo-Local.postman_environment.json \
  --reporters cli

# Run with HTML report output
npx newman run testing/postman/Vingo-API-Collection.postman_collection.json \
  -e testing/postman/Vingo-Local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export testing/postman/newman-report.html
```

---

## 🛡️ Error Path & Invariant Assertions Covered

| HTTP Status | Scenario | Assertion Validation |
| :---: | :--- | :--- |
| `200 / 201` | Auth, Store discovery, Cart operations, State transitions | Schema validation, Token generation, State propagation |
| `400` | Login with missing fields | Validates required field error response |
| `400` | Checkout with empty cart | Rejects checkout with empty cart error message |
| `400` | Vendor advancing beyond READY (`DELIVERED`) | Rejects vendor advancing past state machine boundary |
| `400` | Delivery partner completing order with missing/invalid OTP | Enforces mandatory 4-digit customer delivery OTP |
| `401` | Login with invalid password | Rejects invalid credentials |
| `401` | Accessing `/api/cart`, `/api/orders`, `/api/admin` without token | Enforces JWT presence in Authorization header |
| `403` | Customer attempting to access `/api/vendor/*` | Strict RBAC rejection for non-vendor |
| `403` | Delivery partner attempting to access `/api/admin/*` | Strict RBAC rejection for non-admin |
| `409` | Concurrent acceptance of already assigned delivery order | Validates atomic concurrency lock (`findOneAndUpdate`) |
| **Privacy** | Non-admin querying user profile | Documents (`drivingLicense`, `vehicleRC`, `panCard`, `aadhaarCard`) strictly stripped |

