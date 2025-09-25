// importing types 
import type { ReactElement, ReactNode } from 'react';
import type { BoxProps } from '@mui/material';
import type { LordIconStroke, LordIconTrigger } from './LordIcon.type';

export type GenericAuthModalProps = {
    heading: string,
    subHeading?: string,
    lordicon?: {
        src: string,
        trigger?: LordIconTrigger,
        stroke?: LordIconStroke,
        size?: string,
        primary?: string,
        secondary?: string,
        delay?: number,
    },
    customIcon?: ReactElement,
    children: ReactNode,
} & BoxProps;