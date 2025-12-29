import { test, expect } from '@playwright/test';
import { TEST_USER, TEST_STAFF_USER } from './fixtures/test-data';

test.describe('Staff Features', () => {
  // Helper to login as regular user
  async function loginAsUser(page: typeof import('@playwright/test').Page.prototype) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Close welcome dialog
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(welcomeDialog).not.toBeVisible({ timeout: 5000 });
  }

  // Helper to login as staff user
  async function loginAsStaff(page: typeof import('@playwright/test').Page.prototype) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(TEST_STAFF_USER.email);
    await page.getByLabel('Password').fill(TEST_STAFF_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Close welcome dialog
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(welcomeDialog).not.toBeVisible({ timeout: 5000 });
  }

  test('regular user should not see All Users tab', async ({ page }) => {
    await loginAsUser(page);

    // Navigate to chats
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    // Should see My Chats tab
    await expect(page.getByRole('tab', { name: 'My Chats' })).toBeVisible();

    // Should NOT see All Users tab
    await expect(page.getByRole('tab', { name: 'All Users' })).not.toBeVisible();
  });

  test('staff user should see All Users tab', async ({ page }) => {
    await loginAsStaff(page);

    // Navigate to chats
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    // Should see My Chats tab
    await expect(page.getByRole('tab', { name: 'My Chats' })).toBeVisible();

    // Should see All Users tab
    await expect(page.getByRole('tab', { name: 'All Users' })).toBeVisible();
  });

  test('staff user can view All Users tab content', async ({ page }) => {
    await loginAsStaff(page);

    // Navigate to chats
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    // Click All Users tab
    await page.getByRole('tab', { name: 'All Users' }).click();

    // Should show user selection prompt
    await expect(
      page.getByText('Select a user to view their chats')
    ).toBeVisible({ timeout: 10000 });
  });

  test('staff user can select a user to view their chats', async ({ page }) => {
    await loginAsStaff(page);

    // Navigate to chats
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    // Click All Users tab
    await page.getByRole('tab', { name: 'All Users' }).click();

    // Wait for user list to load
    await expect(page.getByText(/Select a user to view their chats/i)).toBeVisible({ timeout: 10000 });

    // If there are users in the list, click one
    const userItems = page.locator('li').filter({ has: page.getByText(/@/) });
    const userCount = await userItems.count();

    if (userCount > 0) {
      // Click the first user
      await userItems.first().click();

      // Should show that user's chats or "no chats" message
      await expect(
        page.getByText(/chats?|No chats/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
