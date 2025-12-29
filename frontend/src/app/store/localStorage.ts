
export const loadState = () => {
    try {
        const serialState = localStorage.getItem('appState');
        if (serialState === null) {
            return undefined;
        }
        return JSON.parse(serialState);
    } catch {
        return undefined;
    }
};

export const saveState = (state: unknown) => {
    try {
        const serialState = JSON.stringify(state);
        localStorage.setItem('appState', serialState);
    } catch(err) {
        console.error(err);
    }
};
