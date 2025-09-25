import { createContext, useContext, useState } from 'react';
// importing types
import type { AlertState, ContextProviderProps, SnackBarContextType, SnackBarState } from '../types';

const SnackBarContext = createContext<SnackBarContextType>({
    snackBars: [] as SnackBarState[],
    openSnackBar: (_data: AlertState) => { },
    closeSnackBar: (_id: number) => { },
});
export const useSnackBarContext = () => useContext(SnackBarContext);

export const SnackBarProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const [snackBars, setSnackBars] = useState<SnackBarState[]>([]);

    const openSnackBar = (data: AlertState) => {
        const newSnackBar = { ...data, id: Date.now() };
        setSnackBars((prevSnackBars) => [...prevSnackBars, newSnackBar]);
    };

    const closeSnackBar = (id: number) => {
        setSnackBars((prevSnackBars) =>
            prevSnackBars.filter((snackBar) => snackBar.id !== id)
        );
    };

    return (
        <SnackBarContext.Provider
            value={{
                snackBars,
                openSnackBar,
                closeSnackBar,
            }}
        >
            {children}
        </SnackBarContext.Provider>
    );
};