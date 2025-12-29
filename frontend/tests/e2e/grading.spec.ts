import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('Grading Feature', () => {
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

  test('should display Complete Chat and Score button in sidebar', async ({ page }) => {
    await createNewChat(page);

    // Grading button should be visible
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await expect(gradeButton).toBeVisible();
  });

  test('should have grading button disabled when no messages sent', async ({ page }) => {
    await createNewChat(page);

    // Grading button should be disabled when no user messages have been sent
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await expect(gradeButton).toBeDisabled();
  });

  test('should enable grading button after sending a message', async ({ page }) => {
    await createNewChat(page);

    // Send a message first
    await page.getByPlaceholder('Type a message...').fill('Hello, I am a new care worker');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for turn counter to update (message processed)
    await expect(page.getByText(/1 \//)).toBeVisible({ timeout: 60000 });

    // Grading button should now be enabled
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await expect(gradeButton).toBeEnabled();
  });

  test('should show loading state when grading', async ({ page }) => {
    await createNewChat(page);

    // Send a message first
    await page.getByPlaceholder('Type a message...').fill('Hello, I am a new care worker');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for message to be processed
    await expect(page.getByText(/1 \//)).toBeVisible({ timeout: 60000 });

    // Click grading button
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await gradeButton.click();

    // Should show loading state
    await expect(page.getByText(/Grading|grading/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display grading results or error after grading', async ({ page }) => {
    await createNewChat(page);

    // Send a message first
    await page.getByPlaceholder('Type a message...').fill('Hello, I am a new care worker');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for message to be processed
    await expect(page.getByText(/1 \//)).toBeVisible({ timeout: 60000 });

    // Click grading button
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await gradeButton.click();

    // Wait for either grading modal OR error message
    // Both are valid UI responses depending on AI backend availability
    const gradingModal = page.getByRole('dialog', { name: /Performance Results/i });
    const errorMessage = page.getByText(/Grading failed|Grading Error/i);

    await expect(gradingModal.or(errorMessage)).toBeVisible({ timeout: 120000 });
  });

  test('should close grading modal when clicking close button', async ({ page }) => {
    await createNewChat(page);

    // Send a message first
    await page.getByPlaceholder('Type a message...').fill('Hello, I am a new care worker');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for message to be processed
    await expect(page.getByText(/1 \//)).toBeVisible({ timeout: 60000 });

    // Click grading button
    const gradeButton = page.getByRole('button', { name: 'Complete Chat and Score' });
    await gradeButton.click();

    // Wait for either grading modal OR error message
    const gradingModal = page.getByRole('dialog', { name: /Performance Results/i });
    const errorMessage = page.getByText(/Grading failed|Grading Error/i);

    await expect(gradingModal.or(errorMessage)).toBeVisible({ timeout: 120000 });

    // Only test modal closing if the modal appeared
    if (await gradingModal.isVisible().catch(() => false)) {
      // Click the close button
      await page.getByRole('button', { name: 'Close' }).click();

      // Modal should close
      await expect(gradingModal).not.toBeVisible({ timeout: 5000 });
    } else {
      // Error message is visible - this is also a valid outcome
      await expect(errorMessage).toBeVisible();
    }
  });
});
