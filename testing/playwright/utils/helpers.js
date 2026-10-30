/**
 * Helper utility functions for Vingo Playwright tests
 */

/**
 * Log in to Vingo platform with given role credentials
 * @param {import('@playwright/test').Page} page
 * @param {object} credentials
 * @param {'user' | 'vendor' | 'delivery' | 'admin'} roleType
 */
async function loginAs(page, credentials, roleType = 'user') {
  let loginPath = '/login';
  if (roleType === 'vendor') loginPath = '/vendor-login';
  else if (roleType === 'delivery') loginPath = '/delivery/login';
  else if (roleType === 'admin') loginPath = '/admin/login';

  await page.goto(loginPath);
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);

  // Submit form
  await page.click('button[type="submit"]');
}

/**
 * Wait for a specific React Toastify message to appear
 * @param {import('@playwright/test').Page} page
 * @param {string | RegExp} message
 */
async function waitForToast(page, message) {
  const toastLocator = page.locator('.Toastify__toast');
  await toastLocator.first().waitFor({ state: 'visible', timeout: 7000 });
  if (message) {
    if (typeof message === 'string') {
      await page.waitForSelector(`.Toastify__toast:has-text("${message}")`, { timeout: 7000 });
    } else {
      await toastLocator.filter({ hasText: message }).first().waitFor({ state: 'visible', timeout: 7000 });
    }
  }
}

/**
 * Override browser geolocation in Playwright context
 * @param {import('@playwright/test').BrowserContext} context
 * @param {{ latitude: number, longitude: number }} coords
 */
async function setGeolocation(context, coords) {
  await context.setGeolocation(coords);
  await context.grantPermissions(['geolocation']);
}

/**
 * Clears local storage and cookies to reset session
 * @param {import('@playwright/test').Page} page
 */
async function resetSession(page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

module.exports = {
  loginAs,
  waitForToast,
  setGeolocation,
  resetSession,
};

