import Box from '@mui/material/Box';
// importing types
import type { CenteredBoxProps } from '../types';

export const CenteredBox = <C extends React.ElementType = 'div'>(props: CenteredBoxProps<C>) => {
    const { sx, children, ...rest } = props;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }} {...rest}>
            {children}
        </Box>
    );
};