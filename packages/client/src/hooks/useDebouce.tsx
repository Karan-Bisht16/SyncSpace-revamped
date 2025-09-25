import { useEffect } from 'react';

/**
 * Custom hook to debounce an effect callback
 * @param func The function to execute after debounce
 * @param dependencies Dependency array for when to trigger
 * @param delay Debounce delay in ms
*/
export const useDebounce = (
    func: () => void | Promise<void>,
    dependencies: any[],
    delay: number
) => {
    useEffect(() => {
        const handler = setTimeout(() => {
            func();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [...dependencies, delay]);
};