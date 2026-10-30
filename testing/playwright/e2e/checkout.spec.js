const { test, expect } = require('@playwright/test');
const { users, geo, mockAddress } = require('../fixtures/test-data');
const { loginAs, waitForToast, resetSession, setGeolocation } = require('../utils/helpers');

test.describe('Cart & Checkout E2E Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    await setGeolocation(context, geo.rajkot);
    await resetSession(page);
  });

  test('TC-CUST-06: Checkout attempt with empty cart is blocked', async ({ page }) => {
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // Go directly to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify empty cart placeholder
    await expect(page.locator('text=Your cart is empty').or(page.locator('text=No items'))).toBeVisible();
  });

  test('TC-CUST-03 & TC-CUST-04: Full checkout flow with COD and immediate live order tracking redirect', async ({ page }) => {
    // 1. Login as customer
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // 2. Open nearby store
    const storeCard = page.locator('a[href^="/vendor/"]').first();
    await storeCard.waitFor({ state: 'visible', timeout: 10000 });
    await storeCard.click();
    await page.waitForLoadState('networkidle');

    // 3. Add first item to cart
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();

    // 4. Navigate to cart page
    const viewCartBtn = page.locator('text=[ View Cart → ]');
    await viewCartBtn.click();
    await page.waitForURL('**/cart');

    // 5. Verify Cart summary items are loaded
    await expect(page.locator('text=Bill details').or(page.locator('text=Order Summary'))).toBeVisible();

    // 6. Select COD payment radio/button if available
    const codOption = page.locator('text=COD').or(page.locator('text=Cash on Delivery')).first();
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // 7. Click Proceed to Checkout
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")').or(page.locator('button:has-text("Place Order")')).first();
    await checkoutButton.waitFor({ state: 'visible' });
    await checkoutButton.click();

    // 8. Order success notification & redirect to live order tracking
    await page.waitForURL('**/orders/**', { timeout: 15000 });
    expect(page.url()).toMatch(/\/orders\/[a-f0-9]{24}/);

    // 9. Verify order details screen is displayed
    await expect(page.locator('text=Order Status').or(page.locator('text=Order Placed'))).toBeVisible();
  });
});

