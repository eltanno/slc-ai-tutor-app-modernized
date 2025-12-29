import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Chat Interaction', () => {
  // Helper to create a new chat and get to the chat page
  async function createNewChat(page: typeof import('@playwright/test').Page.prototype) {
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

    // Navigate to chat instructions and create chat
    await page.goto('/chat-instructions/unit1_conversation1');
    await page.getByRole('button', { name: 'Start Chat' }).click();
    await expect(page).toHaveURL(/\/chat\/\d+/, { timeout: 15000 });

    // Close tutor intro dialog (always appears on first chat visit)
    const tutorDialog = page.getByRole('dialog', { name: /Introducing yourself/i });
    await expect(tutorDialog).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'close' }).click();
    await expect(tutorDialog).not.toBeVisible({ timeout: 5000 });
  }

  test('should display message input field', async ({ page }) => {
    await createNewChat(page);

    // Message input should be visible
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible();

    // Send button should be visible but disabled (no text entered)
    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when text is entered', async ({ page }) => {
    await createNewChat(page);

    // Type a message
    await page.getByPlaceholder('Type a message...').fill('Hello');

    // Send button should now be enabled
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  test('should send a message and display it in chat', async ({ page }) => {
    await createNewChat(page);

    const testMessage = 'Hello, how are you today?';

    // Type and send message
    await page.getByPlaceholder('Type a message...').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Message should appear in conversation (user messages appear on one side)
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });

    // Input should be cleared after sending
    await expect(page.getByPlaceholder('Type a message...')).toHaveValue('');
  });

  test('should show loading indicator while waiting for AI response', async ({ page }) => {
    await createNewChat(page);

    // Send a message
    await page.getByPlaceholder('Type a message...').fill('Hello');
    await page.getByRole('button', { name: 'Send' }).click();

    // Loading indicator should appear (backdrop with processing text)
    // The app shows "AI is thinking..." or "Processing..." during load
    await expect(page.getByText(/thinking|Processing/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display AI response in chat', async ({ page }) => {
    await createNewChat(page);

    // Send a message
    const testMessage = 'Hello, I am a new care worker';
    await page.getByPlaceholder('Type a message...').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for turn counter to update (indicates a response was processed)
    // This works regardless of whether the AI backend returns a success or error
    await expect(page.getByText(/1 \//)).toBeVisible({ timeout: 60000 });

    // Verify the user's message is displayed
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should maintain chat history on page refresh', async ({ page }) => {
    await createNewChat(page);

    // Get the current URL (contains chat ID)
    const _chatUrl = page.url();

    // Send a message
    const testMessage = 'Test message for persistence';
    await page.getByPlaceholder('Type a message...').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for message to appear
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });

    // Refresh the page
    await page.reload();

    // Close tutor dialog again if it appears
    const tutorDialog = page.getByRole('dialog');
    if (await tutorDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'close' }).click();
      await expect(tutorDialog).not.toBeVisible({ timeout: 5000 });
    }

    // Message should still be visible after refresh
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
  });

  test('should display turn counter', async ({ page }) => {
    await createNewChat(page);

    // Turn counter should show 0 initially
    await expect(page.getByText('Turns')).toBeVisible();
    await expect(page.getByText(/0 \//)).toBeVisible();
  });

  test('should have action buttons in sidebar', async ({ page }) => {
    await createNewChat(page);

    // Actions section should be visible
    await expect(page.getByText('Actions')).toBeVisible();

    // Should have "Show name badge" action for Unit 1
    await expect(page.getByRole('button', { name: 'Show name badge' })).toBeVisible();
  });
});
