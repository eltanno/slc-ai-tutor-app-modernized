/**
 * Custom hook for managing error state with automatic clearing
 */

import { useState, useCallback } from "react";

export interface UseErrorHandlerOptions {
    /** Auto-clear error after this many milliseconds (0 = never) */
    autoClearMs?: number;
    /** Callback when error is set */
    onError?: (error: string) => void;
}

export interface UseErrorHandlerReturn {
    /** Current error message or null */
    error: string | null;
    /** Set an error message */
    setError: (message: string) => void;
    /** Clear the current error */
    clearError: () => void;
    /** Whether there is an error */
    hasError: boolean;
}

/**
 * Hook for managing error state in components
 *
 * @param options Configuration options
 * @returns Error state and handlers
 *
 * @example
 * const { error, setError, clearError, hasError } = useErrorHandler({
 *   autoClearMs: 5000,
 *   onError: (msg) => console.log('Error:', msg)
 * });
 */
export function useErrorHandler(
    options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
    const { autoClearMs = 0, onError } = options;
    const [error, setErrorState] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setErrorState(null);
    }, []);

    const setError = useCallback((message: string) => {
        setErrorState(message);

        if (onError) {
            onError(message);
        }

        if (autoClearMs > 0) {
            setTimeout(() => {
                clearError();
            }, autoClearMs);
        }
    }, [autoClearMs, onError, clearError]);

    return {
        error,
        setError,
        clearError,
        hasError: error !== null
    };
}

export default useErrorHandler;
