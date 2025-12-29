import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Onboarding', () => {
  // Helper to login without closing welcome dialog
  async function loginWithoutClosingWelcome(page: typeof import('@playwright/test').Page.prototype) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  // Helper to clear seen dialogs from localStorage
  async function _clearSeenDialogs(page: typeof import('@playwright/test').Page.prototype) {
    await page.evaluate(() => {
      // Clear redux-persist state to reset seen dialogs
      const persistKey = 'persist:root';
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.preferences) {
          const prefs = JSON.parse(parsed.preferences);
          prefs.seenDialogs = {};
          parsed.preferences = JSON.stringify(prefs);
          localStorage.setItem(persistKey, JSON.stringify(parsed));
        }
      }
    });
  }

  test('should show welcome dialog on first visit', async ({ page }) => {
    await loginWithoutClosingWelcome(page);

    // Welcome dialog should be visible
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });

    // Should show the tutor message
    await expect(page.getByText(/I'm the SLC Tutor/i)).toBeVisible();
    await expect(page.getByText(/choosing your avatar/i)).toBeVisible();
  });

  test('should dismiss welcome dialog when closed', async ({ page }) => {
    await loginWithoutClosingWelcome(page);

    // Wait for welcome dialog
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });

    // Close the dialog
    await page.getByRole('button', { name: 'close' }).click();
    await expect(welcomeDialog).not.toBeVisible({ timeout: 5000 });
  });

  test('should not show welcome dialog after dismissing', async ({ page }) => {
    await loginWithoutClosingWelcome(page);

    // Wait for and close welcome dialog
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(welcomeDialog).not.toBeVisible({ timeout: 5000 });

    // Navigate away and back to dashboard
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    await page.getByRole('link', { name: 'SLC AI Demo App' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Welcome dialog should NOT appear again
    await page.waitForTimeout(1000); // Wait a bit to ensure dialog would have appeared
    await expect(welcomeDialog).not.toBeVisible();
  });

  test('should display avatar selection page with avatar options', async ({ page }) => {
    await loginWithoutClosingWelcome(page);

    // Close welcome dialog first
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();

    // Navigate to avatar select
    await page.getByRole('link', { name: 'Avatar Select' }).click();
    await expect(page).toHaveURL(/\/avatar-select/);

    // Should show the page heading
    await expect(page.getByRole('heading', { name: /Please Select Your Avatar/i })).toBeVisible();

    // Should show avatar images (filtered to show 'carer' avatars)
    const avatarImages = page.getByRole('img');
    await expect(avatarImages.first()).toBeVisible({ timeout: 5000 });
  });

  test('should save avatar selection when confirmed', async ({ page }) => {
    await loginWithoutClosingWelcome(page);

    // Close welcome dialog first
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();

    // Navigate to avatar select
    await page.getByRole('link', { name: 'Avatar Select' }).click();
    await expect(page).toHaveURL(/\/avatar-select/);

    // Click on an avatar
    const avatarCards = page.locator('[class*="MuiCardActionArea"]');
    await expect(avatarCards.first()).toBeVisible({ timeout: 5000 });
    await avatarCards.first().click();

    // Confirm button should appear
    const confirmButton = page.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeVisible();

    // Click confirm - should navigate back to dashboard
    await confirmButton.click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
