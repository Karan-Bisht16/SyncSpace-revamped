// importing types
import type { ReactElement } from 'react';
import type { PopperPlacementType, TooltipProps } from '@mui/material';

export type ToolTipProps = {
    title: string,
    children: ReactElement,
    placement?: PopperPlacementType,
    duration?: number,
} & TooltipProps;