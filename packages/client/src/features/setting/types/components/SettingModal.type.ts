// importing types
import type { ReactNode } from 'react';
import type { ButtonProps } from '@mui/material';

export type ResetSettingButtonProps = {
    children: ReactNode,
    sx?: object,
} & ButtonProps;