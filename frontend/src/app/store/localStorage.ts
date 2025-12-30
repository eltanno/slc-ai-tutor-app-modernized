import { logger } from "../utils/logger";

export const loadState = (): unknown => {
    try {
        const serialState = localStorage.getItem('appState');
        if (serialState === null) {
            return undefined;
        }
        return JSON.parse(serialState) as unknown;
    } catch {
        return undefined;
    }
};

export const saveState = (state: unknown): void => {
    try {
        const serialState = JSON.stringify(state);
        localStorage.setItem('appState', serialState);
    } catch (err) {
        logger.error("Failed to save state to localStorage:", err);
    }
};
