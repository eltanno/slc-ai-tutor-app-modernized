/**
 * Shared API types used across the application.
 *
 * These types are used for consistent API response handling in RTK Query endpoints.
 */

/**
 * Standard paginated response structure from the Django backend.
 *
 * Used by all list endpoints that support pagination.
 *
 * @template T - The type of items in the paginated response
 *
 * @example
 * ```typescript
 * // In an RTK Query endpoint:
 * getChats: builder.query<PaginatedResponse<Chat>, { page?: number }>({
 *   query: ({ page = 1 }) => `/chats/?page=${page}`,
 * });
 * ```
 */
export interface PaginatedResponse<T> {
  /** Status of the response (usually "success") */
  status: string;
  /** Pagination metadata */
  pagination: {
    /** Current page number (1-indexed) */
    page: number;
    /** Number of items per page */
    page_size: number;
    /** Total number of pages */
    total_pages: number;
    /** Total number of items across all pages */
    total_items: number;
    /** Next page number, or null if on last page */
    next_page: number | null;
    /** Previous page number, or null if on first page */
    prev_page: number | null;
  };
  /** Array of items for the current page */
  items: T[];
}

/**
 * Standard API error response structure.
 *
 * Matches the error format returned by Django REST framework.
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Detailed error information */
  data: {
    /** Specific error detail from the API */
    detail: string;
  };
}

/**
 * Standard success response wrapper.
 *
 * @template T - The type of the data payload
 */
export interface ApiResponse<T> {
  /** Status of the response (usually "success") */
  status: string;
  /** Optional message from the API */
  message?: string;
  /** The actual data payload */
  data: T;
}
