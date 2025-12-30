/**
 * Utility functions for consistent error handling across the application.
 */

/**
 * Standard API error structure from RTK Query/fetch responses
 */
export interface ApiErrorResponse {
  data?: {
    detail?: string;
    message?: string;
  };
  message?: string;
  status?: number;
}

/**
 * Extract a user-friendly error message from various error formats.
 *
 * Handles:
 * - RTK Query error responses with data.detail or data.message
 * - Standard Error objects with message property
 * - Unknown error shapes
 *
 * @param error - The error object from an API call or catch block
 * @param defaultMessage - Fallback message if no specific error can be extracted
 * @returns A user-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   const response = await gradeChat(chatId);
 *   if ('error' in response) {
 *     const message = extractErrorMessage(response.error, 'Failed to grade chat');
 *     onError(message);
 *   }
 * } catch (err) {
 *   const message = extractErrorMessage(err, 'An unexpected error occurred');
 *   onError(message);
 * }
 * ```
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (!error) {
    return defaultMessage;
  }

  // Handle ApiErrorResponse shape (RTK Query errors)
  if (typeof error === 'object') {
    const apiError = error as ApiErrorResponse;

    // Check for data.detail (Django REST framework style)
    if (apiError.data?.detail) {
      return apiError.data.detail;
    }

    // Check for data.message (custom API style)
    if (apiError.data?.message) {
      return apiError.data.message;
    }

    // Check for message property (standard Error or direct message)
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Check if an error indicates a specific HTTP status code.
 *
 * @param error - The error object from an API call
 * @param status - The HTTP status code to check for
 * @returns True if the error has the specified status code
 */
export function hasErrorStatus(error: unknown, status: number): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const apiError = error as ApiErrorResponse;
  return apiError.status === status;
}

/**
 * Check if an error message contains a specific phrase (case-insensitive).
 *
 * Useful for detecting specific error conditions like "already requested".
 *
 * @param error - The error object from an API call
 * @param phrase - The phrase to search for in the error message
 * @returns True if the error message contains the phrase
 */
export function errorMessageContains(error: unknown, phrase: string): boolean {
  const message = extractErrorMessage(error, '');
  return message.toLowerCase().includes(phrase.toLowerCase());
}
