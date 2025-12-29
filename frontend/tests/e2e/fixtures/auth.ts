/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, Page } from '@playwright/test';
import { TEST_USER, TEST_STAFF_USER } from './test-data';

// Extend base test with authentication fixtures
export const test = base.extend<{
  authenticatedPage: typeof base;
  staffAuthenticatedPage: typeof base;
}>({
  // Regular user authentication
  authenticatedPage: async ({ page }, use) => {
    await loginUser(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },

  // Staff user authentication
  staffAuthenticatedPage: async ({ page }, use) => {
    await loginUser(page, TEST_STAFF_USER.email, TEST_STAFF_USER.password);
    await use(page);
  },
});

// Helper function to login via the UI
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation to complete after login
  await page.waitForURL('**/dashboard**');
}

// Helper to get API auth token directly (for API-based setup)
export async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  const data = await response.json();
  return data.access;
}

export { expect };
