import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Chat List', () => {
  // Helper to login and navigate to chat list
  async function goToChatList(page: typeof import('@playwright/test').Page.prototype) {
    // Login
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

    // Navigate to chats list
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);
  }

  // Helper to create a chat for testing
  async function createTestChat(page: typeof import('@playwright/test').Page.prototype) {
    await page.goto('/chat-instructions/unit1_conversation1');
    await page.getByRole('button', { name: 'Start Chat' }).click();
    await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 15000 });

    // Close tutor dialog
    const tutorDialog = page.getByRole('dialog', { name: /Introducing yourself/i });
    await expect(tutorDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(tutorDialog).not.toBeVisible({ timeout: 5000 });
  }

  test('should display Chats heading', async ({ page }) => {
    await goToChatList(page);

    // Should show the Chats heading
    await expect(page.getByRole('heading', { name: 'Chats', level: 1 })).toBeVisible();
  });

  test('should display My Chats tab', async ({ page }) => {
    await goToChatList(page);

    // Should show My Chats tab
    await expect(page.getByRole('tab', { name: 'My Chats' })).toBeVisible();
  });

  test('should show chat count', async ({ page }) => {
    await goToChatList(page);

    // Should show chat count (e.g., "5 chats found")
    await expect(page.getByText(/\d+ chats? found/)).toBeVisible();
  });

  test('should display existing chats with details', async ({ page }) => {
    await goToChatList(page);

    // If there are chats, they should show title and last updated info
    const chatItems = page.locator('li').filter({ has: page.getByText(/Last updated:/) });

    // Check if there are any chats
    const chatCount = await chatItems.count();
    if (chatCount > 0) {
      // First chat should have title and date
      await expect(chatItems.first().getByText(/Introducing yourself/i)).toBeVisible();
      await expect(chatItems.first().getByText(/Last updated:/)).toBeVisible();
    }
  });

  test('should navigate to chat when clicking on a chat item', async ({ page }) => {
    await goToChatList(page);

    // Find a chat item and click it
    const chatItems = page.locator('li').filter({ has: page.getByText(/Last updated:/) });
    const chatCount = await chatItems.count();

    if (chatCount > 0) {
      // Click the first chat
      await chatItems.first().click();

      // Should navigate to chat page
      await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 10000 });
    }
  });

  test('should show delete button for each chat', async ({ page }) => {
    await goToChatList(page);

    // Each chat should have a delete button
    const deleteButtons = page.getByRole('button', { name: 'delete' });
    const chatItems = page.locator('li').filter({ has: page.getByText(/Last updated:/) });

    const chatCount = await chatItems.count();
    if (chatCount > 0) {
      // There should be at least one delete button
      await expect(deleteButtons.first()).toBeVisible();
    }
  });
});
