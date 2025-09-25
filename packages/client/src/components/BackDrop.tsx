import Box from '@mui/material/Box';
// imorting types
import type { BackDropProps } from '../types';
// imorting components
import { CenteredBox } from './CenteredBox';
// imorting hooks
import { useNoScroll } from '../hooks/useNoScroll';

export const BackDrop = (props: BackDropProps) => {
    const { opaque, children } = props;

    useNoScroll(true);

    return (
        <Box sx={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <Box
                sx={{ position: 'fixed', inset: 0, zIndex: 200, opacity: opaque ? 1 : 0.5, bgcolor: 'background.default' }}
                onClick={(event) => event.stopPropagation()}
            />
            <CenteredBox sx={{
                flexDirection: 'column',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 250,
            }}>
                {children}
            </CenteredBox>
        </Box>
    );
};