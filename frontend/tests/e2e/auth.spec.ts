import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login form with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Check page title/heading
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Check form fields exist
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.getByLabel('Email Address').fill('invalid@test.com');
    await page.getByLabel('Password').fill('wrongpassword123');

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for API response and check for error message
    await expect(page.getByText(/No active account found|Invalid credentials|Unable to log in/i)).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with valid credentials
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect away from login page
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');

    // Fill with valid credentials
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard should show app header
    await expect(page.getByRole('button', { name: 'SLC AI Demo App' })).toBeVisible();
  });

  test('should successfully logout and redirect to login', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout
    await page.getByRole('link', { name: 'Log out' }).click();

    // Should be back on login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
