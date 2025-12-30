/**
 * Custom hook for handling RTK Query mutations with loading state
 * Provides a consistent pattern for executing mutations with success/error callbacks
 */

import { useState, useCallback } from "react";
import { extractErrorMessage } from "../utils/errorUtils";
import { logger } from "../utils/logger";

export interface MutationResult<TData> {
    data?: TData;
    error?: unknown;
}

export interface UseMutationHandlerOptions<TData, TResult> {
    /** Function to extract the result from the mutation response */
    extractResult?: (data: TData) => TResult;
    /** Default error message if extraction fails */
    defaultErrorMessage?: string;
    /** Callback on successful mutation */
    onSuccess?: (result: TResult) => void;
    /** Callback on error */
    onError?: (error: string) => void;
}

export interface UseMutationHandlerReturn<TArg> {
    /** Whether the mutation is currently loading */
    isLoading: boolean;
    /** Execute the mutation */
    execute: (arg: TArg) => Promise<void>;
}

/**
 * Hook for handling mutations with loading state and error extraction
 *
 * @param mutation The RTK Query mutation function
 * @param options Configuration options
 * @returns Loading state and execute function
 *
 * @example
 * const [gradeChat] = useGradeChatMutation();
 * const { isLoading, execute } = useMutationHandler(
 *   gradeChat,
 *   {
 *     extractResult: (data) => data.grading,
 *     onSuccess: (grading) => setGradingData(grading),
 *     onError: (error) => setErrorMessage(error)
 *   }
 * );
 */
export function useMutationHandler<TArg, TData, TResult = TData>(
    mutation: (arg: TArg) => Promise<MutationResult<TData>>,
    options: UseMutationHandlerOptions<TData, TResult> = {}
): UseMutationHandlerReturn<TArg> {
    const {
        extractResult,
        defaultErrorMessage = "An unexpected error occurred",
        onSuccess,
        onError
    } = options;

    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async (arg: TArg) => {
        setIsLoading(true);

        try {
            const response = await mutation(arg);

            if ('data' in response && response.data) {
                const result = extractResult
                    ? extractResult(response.data)
                    : (response.data as unknown as TResult);

                if (onSuccess) {
                    onSuccess(result);
                }
            } else if ('error' in response) {
                logger.error("Mutation API Error:", response.error);
                const errorDetail = extractErrorMessage(
                    response.error,
                    defaultErrorMessage
                );
                if (onError) {
                    onError(errorDetail);
                }
            }
        } catch (err) {
            logger.error("Mutation error:", err);
            const errorMessage = extractErrorMessage(err, defaultErrorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [mutation, extractResult, defaultErrorMessage, onSuccess, onError]);

    return {
        isLoading,
        execute
    };
}

export default useMutationHandler;
