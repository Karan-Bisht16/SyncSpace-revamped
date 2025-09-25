import Box from '@mui/material/Box';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { PageBaseProps } from '../types';

export const PageBase = (props: PageBaseProps) => {
    const { sx, children, ...rest } = props;

    const { navbarHeightPx } = clientConfig;

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            pt: `${navbarHeightPx}px`,
            color: 'text.primary',
            bgcolor: 'background.default',
            ...sx,
        }} {...rest}>
            {children}
        </Box>
    );
};