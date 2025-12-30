/**
 * Utility functions for consistent date formatting across the application.
 */

/**
 * Format a date string to a locale-specific representation.
 *
 * Uses the browser's locale settings for consistent formatting.
 *
 * @param dateString - ISO 8601 date string or any parseable date format
 * @returns Formatted date and time string (e.g., "12/30/2025, 4:30:00 PM")
 *
 * @example
 * ```typescript
 * formatDate('2025-12-30T16:30:00Z'); // "12/30/2025, 4:30:00 PM"
 * ```
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Format a date string to show only the date portion.
 *
 * @param dateString - ISO 8601 date string or any parseable date format
 * @returns Formatted date string (e.g., "12/30/2025")
 *
 * @example
 * ```typescript
 * formatDateOnly('2025-12-30T16:30:00Z'); // "12/30/2025"
 * ```
 */
export function formatDateOnly(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Format a date string to show only the time portion.
 *
 * @param dateString - ISO 8601 date string or any parseable date format
 * @returns Formatted time string (e.g., "4:30:00 PM")
 *
 * @example
 * ```typescript
 * formatTimeOnly('2025-12-30T16:30:00Z'); // "4:30:00 PM"
 * ```
 */
export function formatTimeOnly(dateString: string): string {
  return new Date(dateString).toLocaleTimeString();
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "yesterday").
 *
 * @param dateString - ISO 8601 date string or any parseable date format
 * @returns Human-readable relative time string
 *
 * @example
 * ```typescript
 * formatRelativeTime('2025-12-30T14:30:00Z'); // "2 hours ago"
 * formatRelativeTime('2025-12-29T16:30:00Z'); // "yesterday"
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays === 1) {
    return 'yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // For older dates, return the formatted date
  return formatDate(dateString);
}
