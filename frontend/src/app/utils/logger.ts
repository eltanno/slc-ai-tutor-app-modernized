/**
 * Logging utility with environment awareness
 * Logs are only output in development mode to keep production console clean
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log an error message (always logs, even in production for critical issues)
     */
    error: (message: string, ...args: unknown[]): void => {
        console.error(`[ERROR] ${message}`, ...args);
    },

    /**
     * Log a warning message (dev only)
     */
    warn: (message: string, ...args: unknown[]): void => {
        if (isDev) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },

    /**
     * Log an info message (dev only)
     */
    info: (message: string, ...args: unknown[]): void => {
        if (isDev) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    /**
     * Log a debug message (dev only)
     */
    debug: (message: string, ...args: unknown[]): void => {
        if (isDev) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },
};

export default logger;
