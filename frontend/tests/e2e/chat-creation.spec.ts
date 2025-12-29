import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Chat Creation', () => {
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

  test('should navigate to chat instructions when clicking scenario card', async ({ page }) => {
    // Click on Mrs Jameson scenario card (Unit 1)
    await page.getByRole('link', { name: 'Mrs Jameson' }).click();

    // Should navigate to chat instructions page
    await expect(page).toHaveURL(/\/chat-instructions\/unit1_conversation1/);
  });

  test('should display chat instructions with resident info', async ({ page }) => {
    // Navigate to a chat instructions page
    await page.goto('/chat-instructions/unit1_conversation1');

    // Should show the unit title (actual title is the scenario name, not "Unit 1")
    await expect(page.getByRole('heading', { name: /Introducing yourself/i, level: 1 })).toBeVisible();

    // Should show Resident Information section
    await expect(page.getByText('Resident Information')).toBeVisible();

    // Should show the Start Chat button
    await expect(page.getByRole('button', { name: 'Start Chat' })).toBeVisible();
  });

  test('should show Start Chat button that creates new chat', async ({ page }) => {
    // Navigate to chat instructions
    await page.goto('/chat-instructions/unit1_conversation1');

    // Click Start Chat button
    await page.getByRole('button', { name: 'Start Chat' }).click();

    // Should navigate to chat page (chat/:id pattern)
    await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 15000 });
  });

  test('should display chat interface after creating chat', async ({ page }) => {
    // Navigate to chat instructions and start chat
    await page.goto('/chat-instructions/unit1_conversation1');
    await page.getByRole('button', { name: 'Start Chat' }).click();

    // Wait for chat page to load
    await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 15000 });

    // A tutor dialog appears - close it first
    const tutorDialog = page.getByRole('dialog');
    if (await tutorDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'close' }).click();
      await expect(tutorDialog).not.toBeVisible({ timeout: 5000 });
    }

    // Chat interface should be visible (message input area)
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible({ timeout: 10000 });
  });

  test('should show new chat in chat list', async ({ page }) => {
    // Navigate to chat instructions and start chat
    await page.goto('/chat-instructions/unit1_conversation1');
    await page.getByRole('button', { name: 'Start Chat' }).click();

    // Wait for chat to be created
    await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 15000 });

    // Navigate to chats list
    await page.getByRole('link', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats/);

    // Should show the new chat in the list (title is the scenario name)
    // Use .first() since there may be multiple chats from previous runs
    await expect(page.getByText(/Introducing yourself/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show error page for invalid chat instructions ID', async ({ page }) => {
    // Navigate to non-existent chat instructions
    await page.goto('/chat-instructions/invalid_chat_id');

    // Should show error message
    await expect(page.getByText(/Chat not found/i)).toBeVisible();
  });
});
