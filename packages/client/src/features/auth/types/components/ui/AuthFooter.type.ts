// importing types
import type { MouseEvent, ReactNode } from 'react';
import type { ButtonProps } from '@mui/material';
import type { AuthMode } from '../AuthModal.type';

export type AuthFooterProps = {
    authMode: AuthMode,
    toggleAuthModal: (event: MouseEvent) => void
};

export type AuthCaptionProps = AuthFooterProps;

export type AuthProvidersProps = {
    signUpWithGoogle: () => void,
    signUpWithFacebook: () => void,
};

export type StyledAuthProviderButtonProps = {
    provider: string,
    icon: ReactNode,
    sx?: object,
} & ButtonProps;