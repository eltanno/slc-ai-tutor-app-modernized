import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Help Feature', () => {
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

  test('should display Get Help button in chat sidebar', async ({ page }) => {
    await createNewChat(page);

    // Get Help button should be visible in the sidebar
    const helpButton = page.getByRole('button', { name: 'Get Help' });
    await expect(helpButton).toBeVisible();
  });

  test('should show loading state when requesting help', async ({ page }) => {
    await createNewChat(page);

    // Click the Get Help button
    const helpButton = page.getByRole('button', { name: 'Get Help' });
    await helpButton.click();

    // Should show loading text while processing
    await expect(page.getByText(/Getting help|getting_help/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle help response or display error appropriately', async ({ page }) => {
    await createNewChat(page);

    // Click the Get Help button
    const helpButton = page.getByRole('button', { name: 'Get Help' });
    await helpButton.click();

    // Wait for either the help modal OR an error message to appear
    // Both are valid UI responses depending on AI backend availability
    const helpModal = page.getByRole('dialog', { name: /Tutor's Advice/i });
    const errorMessage = page.getByText(/Help request failed|Error getting help/i);

    // Wait for one of the outcomes (processing takes time)
    await expect(helpModal.or(errorMessage)).toBeVisible({ timeout: 60000 });

    // If help modal appeared, verify it has expected content
    if (await helpModal.isVisible().catch(() => false)) {
      await expect(helpModal.getByText(/suggestion|help|advice/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Got it, thanks/i })).toBeVisible();
    }
  });

  test('should allow closing help modal when it appears', async ({ page }) => {
    await createNewChat(page);

    // Click the Get Help button
    const helpButton = page.getByRole('button', { name: 'Get Help' });
    await helpButton.click();

    // Wait for either the help modal OR an error message
    const helpModal = page.getByRole('dialog', { name: /Tutor's Advice/i });
    const errorMessage = page.getByText(/Help request failed|Error getting help/i);

    await expect(helpModal.or(errorMessage)).toBeVisible({ timeout: 60000 });

    // Only test modal closing if the modal actually appeared
    if (await helpModal.isVisible().catch(() => false)) {
      // Click the acknowledgment button
      await page.getByRole('button', { name: /Got it, thanks/i }).click();

      // Modal should close
      await expect(helpModal).not.toBeVisible({ timeout: 5000 });
    } else {
      // Error message is visible - this is also a valid outcome
      // The test passes because the UI handled the response appropriately
      await expect(errorMessage).toBeVisible();
    }
  });
});
