import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { SyntheticEvent } from 'react';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import type { SnackBarProps } from '../types';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';
// importing hooks
import { useMobile } from '../hooks/useMobile';

const SnackBar = (props: SnackBarProps) => {
    const { snackBarData, onClose } = props;
    const { id, status, message } = snackBarData;

    const { transitionDurationMs, snackbarTimeOutMs } = clientConfig;

    const isMobile = useMobile();

    const handleClose = (_event: SyntheticEvent | Event, reason: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        onClose(id);
    };

    return (
        <Snackbar
            open={true}
            autoHideDuration={snackbarTimeOutMs}
            transitionDuration={transitionDurationMs}
            anchorOrigin={{
                vertical: isMobile ? 'top' : 'bottom',
                horizontal: 'right',
            }}
            onClose={handleClose}
            sx={{ position: 'static', pointerEvents: 'auto', }}
        >
            <Alert
                variant='filled'
                severity={status}
                onClose={handleClose as any}
                sx={{ color: 'white', width: isMobile ? '100%' : 'fit-content' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export const SnackBars = () => {
    const { snackBars, closeSnackBar } = useSnackBarContext();

    return (
        <Box sx={{
            display: 'flex',
            flexFlow: 'column-reverse',
            gap: 0.5,
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            p: 1,
            pointerEvents: 'none',
            zIndex: (theme) => theme.zIndex.snackbar || 140,
        }}>
            {snackBars?.map((snackBar) => (
                <SnackBar
                    key={snackBar.id}
                    snackBarData={snackBar}
                    onClose={closeSnackBar}
                />
            ))}
        </Box>
    );
};