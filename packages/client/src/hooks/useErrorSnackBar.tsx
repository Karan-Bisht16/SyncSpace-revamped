import { ApiError } from '@syncspace/shared';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';

export const useErrorSnackBar = () => {
    const { openSnackBar } = useSnackBarContext();

    const showErrorSnackBar = (response: any) => {
        if (response instanceof ApiError) {
            openSnackBar({
                status: 'error',
                message: response.message,
            });
        }
    };

    return showErrorSnackBar;
};