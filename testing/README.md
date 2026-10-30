# 🧪 Test Suite for Vingo (4-Role Hyperlocal Delivery Platform)

Welcome to the automated and manual testing suite for **Vingo** (QuickMart). This directory is a self-contained testing suite covering the complete platform lifecycle across **Customer (`user`)**, **Vendor (`vendor`)**, **Delivery Partner (`deliveryPartner`)**, and **Administrator (`admin`)** roles.

---

## 🏗️ Test Suite Architecture

```
testing/
├── README.md                                  # Top-level documentation & traceability matrix
│
├── manual-test-cases/                         # 46 Structured Manual Test Cases
│   ├── test-cases.md                          # Detailed specifications (Steps, Preconditions, Assertions)
│   └── test-matrix.csv                        # CSV export for TestRail, Jira Xray, and Google Sheets
│
├── postman/                                   # REST API Assertion Suite (Postman & Newman)
│   ├── Vingo-API-Collection.postman_collection.json # 28+ requests with pm.test() assertions
│   ├── Vingo-Local.postman_environment.json   # Seeded environment variables & dynamic tokens
│   └── README.md                              # Postman & Newman execution guide
│
├── playwright/                                # Playwright E2E Automation Framework
│   ├── package.json                           # Playwright dependencies & test runner scripts
│   ├── playwright.config.js                   # Cross-browser configurations (Chromium, Firefox, WebKit)
│   ├── e2e/
│   │   ├── login.spec.js                      # 4-role login tests, 401 errors, form validation
│   │   ├── add-to-cart.spec.js                # Gated login, product selection, floating cart pill
│   │   ├── checkout.spec.js                   # Empty cart guard, COD checkout, live order tracking
│   │   └── role-access.spec.js                # Strict RBAC routing & unauthorized redirects
│   ├── fixtures/
│   │   └── test-data.js                       # Test credentials, addresses, and GPS coordinates
│   ├── utils/
│   │   └── helpers.js                         # Reusable page actions, toast waiters, session reset
│   └── README.md                              # Playwright CLI & UI execution guide
│
└── github-issues/                             # Defect Management & Issue Templates
    ├── ISSUE_TEMPLATE/
    │   └── bug_report.md                      # GitHub Bug Report issue template
    ├── defect-log.md                          # Logged defects with reproduction steps, severity, and fixes
    └── defects.json                           # Structured JSON defect records
```

---

## 🎯 Coverage Highlights

### 1. Manual Test Suite (46 Test Cases)
- **4 Roles Covered**: Customer, Vendor, Delivery Partner, Admin.
- **Test Categories**: Positive (`POS`), Negative (`NEG`), Boundary (`BND`), and Security/Concurrency (`SEC`).
- **Core Invariants Tested**:
  - Max 3 featured products per store limit.
  - Document privacy: verification documents visible strictly to admins.
  - Dual state machine transitions: Vendor halts at `READY`; Delivery partner takes over (`ASSIGNED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`).
  - Mandatory customer 4-digit OTP verification upon order delivery.
  - 20km Haversine geo-radius filtering for delivery dispatches.

### 2. Postman & Newman API Suite
- **28+ API requests** with **90+ JavaScript `pm.test()` assertions**.
- Automated token chaining across Customer, Vendor, Delivery Partner, and Admin roles.
- Comprehensive status code verification:
  - `200 OK` / `201 Created`: Successful operations & valid state transitions.
  - `400 Bad Request`: Empty cart checkout, invalid credentials, missing delivery OTP, 4th featured product attempt.
  - `401 Unauthorized`: Unauthenticated access, invalid/expired JWT tokens.
  - `403 Forbidden`: Cross-role violations (e.g. Customer accessing Vendor APIs, Delivery partner accessing Admin console).
  - `409 Conflict`: Atomic concurrency locking on duplicate delivery acceptance.

### 3. Playwright E2E Automation
- Cross-browser test coverage across Chromium, Firefox, WebKit, and Mobile Chrome viewports.
- **Login Suite**: Authenticates each of the 4 roles, verifying role-specific URL confinements (`/vendor-dashboard`, `/delivery/dashboard`, `/admin/dashboard`, `/`).
- **Add to Cart Suite**: Validates unauthenticated login gating, product addition, dynamic floating cart price updates, and quantity controls.
- **Checkout Suite**: Validates address selection, COD payment selection, order placement, and seamless navigation to live order tracking (`/orders/:orderId`).
- **Role Routing Guard Suite**: Validates client-side route redirects when unauthorized roles manually type restricted URLs.

### 4. Defect Tracking (GitHub Issues)
- 6 detailed defect reports logged with steps to reproduce, expected vs. actual outcomes, severity ratings (Critical, High, Medium), root-cause analysis, and resolution verification status.

---

## ⚡ Quick Start Guides

### Running the API Tests (Newman)
```bash
# Make sure backend is running on http://localhost:5000
npx newman run testing/postman/Vingo-API-Collection.postman_collection.json \
  -e testing/postman/Vingo-Local.postman_environment.json \
  --reporters cli
```

### Running the Playwright E2E Tests
```bash
# 1. Navigate to Playwright directory
cd testing/playwright

# 2. Install dependencies
npm install
npx playwright install --with-deps chromium

# 3. Run all end-to-end tests
npm test

# 4. Open interactive Playwright UI mode
npm run test:ui
```

---

## 📊 Requirements Traceability Matrix (RTM)

| Feature Requirement | Manual Test IDs | API Postman Tests | Playwright E2E Tests | Defect ID |
| :--- | :--- | :--- | :--- | :--- |
| **4-Role Authentication** | `TC-AUTH-01` to `TC-AUTH-05` | `01_Auth` (Login 1-4, 401/400) | `login.spec.js` | — |
| **Role-Based Access Routing** | `TC-AUTH-06` to `TC-AUTH-08` | `05_Vendor` (403), `07_Admin` (403) | `role-access.spec.js` | — |
| **Document Privacy Rule** | `TC-AUTH-09` | `Verify Token Profile (Non-Admin)` | — | `BUG-102` |
| **Store Catalog & Distance** | `TC-CUST-01`, `TC-DELV-01` | `02_Stores_Catalog` | `add-to-cart.spec.js` | — |
| **Add to Cart & Floating Pill**| `TC-CUST-02`, `TC-CUST-05` | `03_Cart_Operations` | `add-to-cart.spec.js` | `BUG-106` |
| **Cart Checkout & Live Tracking**| `TC-CUST-03`, `TC-CUST-04` | `04_Order_Creation_Checkout` | `checkout.spec.js` | — |
| **Vendor State Transitions** | `TC-VEND-02`, `TC-VEND-05` | `05_Vendor_State_Machine` | — | `BUG-104` |
| **Max 3 Featured Products** | `TC-VEND-03`, `TC-VEND-04` | `02_Stores_Catalog`, `05_Vendor` | — | `BUG-103` |
| **Atomic Delivery Acceptance** | `TC-DELV-02`, `TC-DELV-04` | `06_Delivery_Partner_Flow` (409) | — | `BUG-101` |
| **Delivery OTP Handover** | `TC-DELV-03`, `TC-DELV-05` | `06_Delivery_Partner_Flow` (400/200)| — | `BUG-105` |
| **Admin Approvals & KPIs** | `TC-ADMN-01` to `TC-ADMN-03` | `07_Admin_Console_RBAC` | `login.spec.js` | — |
| **Area Expansion Wishlist** | `TC-CUST-11`, `TC-ADMN-07` | `08_Wishlist_Coverage` | — | — |

