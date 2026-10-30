const { test, expect } = require('@playwright/test');
const { users, geo } = require('../fixtures/test-data');
const { loginAs, waitForToast, resetSession, setGeolocation } = require('../utils/helpers');

test.describe('Authentication & Role Routing E2E Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    await setGeolocation(context, geo.rajkot);
    await resetSession(page);
  });

  test('TC-AUTH-02: Customer successfully logs in and views home marketplace', async ({ page }) => {
    await loginAs(page, users.customer, 'user');

    // Wait for redirect to home
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Validate auth token is set in localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();

    // Verify Nav bar renders user avatar/profile or cart icon
    await expect(page.locator('nav')).toBeVisible();
  });

  test('TC-AUTH-03: Vendor login strictly routes to /vendor-dashboard', async ({ page }) => {
    await loginAs(page, users.vendor, 'vendor');

    // Wait for redirect to vendor dashboard
    await page.waitForURL('**/vendor-dashboard', { timeout: 10000 });

    // Verify Vendor Dashboard elements exist
    await expect(page.locator('text=Vendor Dashboard').or(page.locator('text=Overview'))).toBeVisible();
  });

  test('TC-AUTH-04: Delivery Partner login strictly routes to /delivery/dashboard', async ({ page }) => {
    await loginAs(page, users.deliveryPartner, 'delivery');

    // Wait for redirect to delivery dashboard
    await page.waitForURL('**/delivery/dashboard', { timeout: 10000 });

    // Verify Delivery Dashboard UI elements
    await expect(page.locator('text=Delivery').or(page.locator('text=Available Orders'))).toBeVisible();
  });

  test('TC-AUTH-05: Admin login strictly routes to /admin/dashboard', async ({ page }) => {
    await loginAs(page, users.admin, 'admin');

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Verify Admin Console elements
    await expect(page.locator('text=Admin').or(page.locator('text=Overview'))).toBeVisible();
  });

  test('TC-AUTH-06: Failed login with wrong password displays error notification', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', users.customer.username);
    await page.fill('input[name="password"]', 'completely_wrong_password');
    await page.click('button[type="submit"]');

    // Verify Toast error notification appears
    await waitForToast(page);

    // Verify user remains on /login page
    expect(page.url()).toContain('/login');
  });

  test('TC-AUTH-07: Login form enforces required fields validation', async ({ page }) => {
    await page.goto('/login');
    // Click submit without entering any credentials
    await page.click('button[type="submit"]');

    // Assert validation toast
    await waitForToast(page, 'Please fill all fields');
  });
});

