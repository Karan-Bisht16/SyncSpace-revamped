// importing types
import type { SnackBarState } from '../contexts/snackbar.context.type';

export type SnackBarProps = {
    snackBarData: SnackBarState,
    onClose: (_id: number) => void,
};