const isDev = import.meta.env.VITE_MODE === 'DEVELOPMENT';

export const logMessage = (...args: any[]) => {
    if (isDev) {
        console.log(...args);
    }
};

export const logWarn = (...args: any[]) => {
    if (isDev) {
        console.warn(...args);
    }
};

export const logError = (...args: any[]) => {
    if (isDev) {
        console.error(...args);
    }
};

export const logDir = (...args: any[]) => {
    if (isDev) {
        console.dir(...args);
    }
};