import { Bouncy } from 'ldrs/react';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
// importing types
import type { CircularProgressProps, LinearProgressProps } from '@mui/material';
import type { LoaderProps, LoadingModalProps } from '../types';
// importing contexts
import { useThemeContext } from '../contexts/theme.context';
// importing components
import { BackDrop } from './BackDrop';
// importing styling
import 'ldrs/react/Bouncy.css'

export const LoadingModal = (props: LoadingModalProps) => {
    const { loader, children } = props;

    return (
        <BackDrop>
            <Loader {...loader} />
            {children}
        </BackDrop>
    );
};

const Loader = (props: LoaderProps) => {
    const { progress, size = 100, color = 'primary', sx, ...rest } = props;

    const { designTokens } = useThemeContext();

    switch (progress) {
        case 'linear':
            return (
                <LinearProgress
                    color={color}
                    sx={{ width: size, mb: 1.125, ...sx }}
                    {...rest as LinearProgressProps}
                />
            );
        case 'circular':
            return (
                <CircularProgress
                    size={size}
                    color={color}
                    sx={{ mb: 1.125, ...sx }}
                    {...rest as CircularProgressProps}
                />
            );
        default:
            return (
                <Bouncy
                    size={size}
                    speed='1'
                    color={designTokens?.palette?.primary?.main}
                />
            );
    }
};