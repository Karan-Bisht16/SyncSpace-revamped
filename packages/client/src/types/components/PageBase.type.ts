// importing types
import type { ReactNode } from 'react';
import type { BoxProps } from '@mui/material';

export type PageBaseProps = {
    sx?: object,
    children?: ReactNode,
} & BoxProps;