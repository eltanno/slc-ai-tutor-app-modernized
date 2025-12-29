import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Dashboard & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Welcome dialog always appears on first dashboard visit - wait for it and close it
    const welcomeDialog = page.getByRole('dialog', { name: 'Welcome to the site!' });
    await expect(welcomeDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(welcomeDialog).not.toBeVisible({ timeout: 5000 });
  });

  test('should display training units with scenario cards', async ({ page }) => {
    // Check Training Scenarios heading
    await expect(page.getByRole('heading', { name: 'Training Scenarios' })).toBeVisible();

    // Check that units are displayed
    await expect(page.getByRole('heading', { name: /Unit 1:/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Unit 2:/ })).toBeVisible();

    // Check that scenario cards exist (at least one persona name)
    await expect(page.getByText('Mrs Jameson')).toBeVisible();
  });

  test('should show welcome message with user email', async ({ page }) => {
    // Check welcome heading contains user email
    await expect(page.getByRole('heading', { name: new RegExp(`Welcome.*${TEST_USER.email}`, 'i') })).toBeVisible();
  });

  test('should navigate to chats page', async ({ page }) => {
    // Click Chats link in navigation
    await page.getByRole('link', { name: 'Chats' }).click();

    // Should be on chats page
    await expect(page).toHaveURL(/\/chats/);
  });

  test('should navigate to avatar select page', async ({ page }) => {
    // Click Avatar Select link in navigation
    await page.getByRole('link', { name: 'Avatar Select' }).click();

    // Should be on avatar select page
    await expect(page).toHaveURL(/\/avatar-select/);
  });
});
