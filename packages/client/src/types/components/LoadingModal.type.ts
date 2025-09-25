// importing types
import type { ReactNode } from 'react';
import type { CircularProgressProps, LinearProgressProps } from '@mui/material';

export type LoaderProps = {
    size?: number,
} & (({
    progress?: 'linear',
    color?: LinearProgressProps['color'],
} & LinearProgressProps) | ({
    progress?: 'circular',
    color?: CircularProgressProps['color'],
} & CircularProgressProps));

export type LoadingModalProps = {
    loader?: LoaderProps,
    opaque?: boolean,
    children?: ReactNode,
};