const { test, expect } = require('@playwright/test');
const { users, geo } = require('../fixtures/test-data');
const { loginAs, resetSession, setGeolocation } = require('../utils/helpers');

test.describe('Role-Based Strict Routing & Access Guards', () => {
  test.beforeEach(async ({ page, context }) => {
    await setGeolocation(context, geo.rajkot);
    await resetSession(page);
  });

  test('TC-AUTH-06: Customer attempting to navigate to /vendor-dashboard is redirected', async ({ page }) => {
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // Customer attempts to open vendor dashboard directly
    await page.goto('/vendor-dashboard');

    // App routes customer back to / (or login if unverified)
    await page.waitForURL('**/', { timeout: 7000 });
    expect(page.url()).not.toContain('/vendor-dashboard');
  });

  test('TC-AUTH-07: Customer attempting to navigate to /admin/dashboard is redirected to /admin/login', async ({ page }) => {
    await loginAs(page, users.customer, 'user');
    await page.waitForURL('**/');

    // Customer attempts to open admin dashboard
    await page.goto('/admin/dashboard');

    // Routed to admin login
    await page.waitForURL('**/admin/login', { timeout: 7000 });
    expect(page.url()).toContain('/admin/login');
  });

  test('TC-AUTH-08: Vendor attempting to navigate to /delivery/dashboard is restricted to /vendor-dashboard', async ({ page }) => {
    await loginAs(page, users.vendor, 'vendor');
    await page.waitForURL('**/vendor-dashboard');

    // Vendor attempts to open delivery dashboard
    await page.goto('/delivery/dashboard');

    // Should remain locked to vendor dashboard
    await page.waitForURL('**/vendor-dashboard', { timeout: 7000 });
    expect(page.url()).toContain('/vendor-dashboard');
  });

  test('TC-DELV-06: Delivery partner attempting to access /vendor-dashboard is restricted to /delivery/dashboard', async ({ page }) => {
    await loginAs(page, users.deliveryPartner, 'delivery');
    await page.waitForURL('**/delivery/dashboard');

    // Rider attempts to open vendor dashboard
    await page.goto('/vendor-dashboard');

    // Should remain locked to delivery dashboard
    await page.waitForURL('**/delivery/dashboard', { timeout: 7000 });
    expect(page.url()).toContain('/delivery/dashboard');
  });
});

