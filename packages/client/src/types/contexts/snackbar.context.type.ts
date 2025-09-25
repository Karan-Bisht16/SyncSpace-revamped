// importing types
import type { AlertColor } from '@mui/material';

export type AlertState = {
    status: AlertColor,
    message: string,
};

export type SnackBarState = { id: number } & AlertState;

export type SnackBarContextType = {
    snackBars: SnackBarState[],
    openSnackBar: (data: AlertState) => void,
    closeSnackBar: (id: number) => void,
};