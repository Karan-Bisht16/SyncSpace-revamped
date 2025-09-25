import { useMediaQuery } from '@mui/material';
// importing data
import { clientConfig } from '../data/constants.data';

export const useMobile = () => {
    const { mobileBreakpointPx } = clientConfig;

    const isMobile = useMediaQuery(`(max-width:${mobileBreakpointPx}px)`);

    return isMobile;
};