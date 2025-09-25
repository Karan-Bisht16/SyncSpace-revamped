export const delay = (ms: number): Promise<true> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    });
};