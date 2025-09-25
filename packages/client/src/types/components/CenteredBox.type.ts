// importing types
import type { ReactNode } from 'react';
import type { BoxProps } from '@mui/material';

export type CenteredBoxProps<C extends React.ElementType = 'div'> = {
    component?: C;
    children?: ReactNode;
    sx?: BoxProps['sx'];
} & Omit<BoxProps<C>, 'component' | 'sx' | 'children'>;