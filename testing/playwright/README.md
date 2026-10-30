# Vingo (QuickMart) — Playwright E2E Automation Suite

Automated end-to-end testing suite for Vingo (4-Role Hyperlocal Marketplace & Delivery Platform) built with [Playwright](https://playwright.dev/).

---

## 🎯 Test Coverage

| Test Spec File | Scenarios Covered | Target Role |
| :--- | :--- | :--- |
| **`e2e/login.spec.js`** | • Customer Login & Homepage Nav<br>• Vendor Login & Router Lock<br>• Delivery Rider Login & Dashboard<br>• Admin Console Login<br>• Invalid Credentials 401 Toast<br>• Empty Fields Form Validation | Customer, Vendor, Delivery Partner, Admin |
| **`e2e/add-to-cart.spec.js`** | • Unauthenticated Add-to-Cart Login Gate<br>• Product Add & Floating Cart Trigger<br>• Quantity Increment & Subtotal Sync | Customer |
| **`e2e/checkout.spec.js`** | • Empty Cart Checkout Guard<br>• End-to-End Order Placement (COD)<br>• Immediate `/orders/:orderId` Redirect | Customer |
| **`e2e/role-access.spec.js`** | • Customer to Vendor URL RBAC Guard<br>• Customer to Admin URL Guard<br>• Cross-role strict URL confinement | All Roles |

---

## 🛠️ Setup & Prerequisites

1. Ensure the backend and frontend are running:
   ```bash
   # Terminal 1: Backend API (port 5000)
   cd backend && npm start

   # Terminal 2: Frontend Vite (port 5173)
   cd hybridCom && npm run dev
   ```

2. Install Playwright dependencies inside `testing/playwright`:
   ```bash
   cd testing/playwright
   npm install
   npx playwright install --with-deps chromium
   ```

---

## 🧪 Running the Tests

```bash
# Run all tests headlessly across Chromium, Firefox, WebKit
npm test

# Run tests in headed browser mode (visible UI)
npm run test:headed

# Open Playwright Interactive UI Mode
npm run test:ui

# Run only authentication tests
npm run test:auth

# Run only cart tests
npm run test:cart

# Run only checkout tests
npm run test:checkout

# View the generated HTML test report
npm run test:report
```

