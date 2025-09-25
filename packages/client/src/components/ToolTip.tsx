import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { ToolTipProps } from '../types';

export const ToolTip = (props: ToolTipProps) => {
    const { title, children, placement = 'bottom', duration } = props;

    const { transitionDurationMs } = clientConfig;

    return (
        <Tooltip
            title={title}
            placement={placement}
            slots={{ transition: Fade }}
            slotProps={{
                transition: { timeout: duration ?? transitionDurationMs },
            }}
        >
            {children}
        </Tooltip>
    );
};