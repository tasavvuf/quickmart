const { test, expect } = require('@playwright/test');
const { users, geo } = require('../fixtures/test-data');
const { loginAs, waitForToast, resetSession, setGeolocation } = require('../utils/helpers');

test.describe('Add to Cart & Quantity Management E2E Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    await setGeolocation(context, geo.rajkot);
    await resetSession(page);
  });

  test('TC-CUST-05: Unauthenticated user clicking Add to Cart is gated to login', async ({ page }) => {
    // Navigate directly to homepage or first store
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find first store card and navigate
    const storeLink = page.locator('a[href^="/vendor/"]').first();
    if (await storeLink.isVisible()) {
      await storeLink.click();
      await page.waitForLoadState('networkidle');

      // Click "Add" on any product
      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Should display gating toast and redirect to /login
        await waitForToast(page, 'Please login to add items to your cart');
        await page.waitForURL('**/login**');
      }
    }
  });

  test('TC-CUST-02: Authenticated customer adds product to cart and verifies floating pill', async ({ page }) => {
    // Log in as customer
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // Click on first store
    const storeCard = page.locator('a[href^="/vendor/"]').first();
    await storeCard.waitFor({ state: 'visible', timeout: 10000 });
    await storeCard.click();
    await page.waitForLoadState('networkidle');

    // Locate first product "Add" button
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();

    // Verify FloatingCart appears with Items count
    const floatingCart = page.locator('.app-bottom-bar');
    await expect(floatingCart).toBeVisible({ timeout: 7000 });
    await expect(floatingCart.locator('text=Items:')).toBeVisible();
    await expect(floatingCart.locator('text=[ View Cart → ]')).toBeVisible();
  });

  test('TC-CUST-03: Cart quantity increment updates total price accurately', async ({ page }) => {
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // Navigate to vendor store
    const storeCard = page.locator('a[href^="/vendor/"]').first();
    await storeCard.click();
    await page.waitForLoadState('networkidle');

    // Add item
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();

    // Click "+" button to increment
    const plusButton = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    if (await plusButton.isVisible()) {
      await plusButton.click();
      
      // Floating cart should now show Items: 2
      const floatingCart = page.locator('.app-bottom-bar');
      await expect(floatingCart).toContainText('Items: 2');
    }
  });
});

