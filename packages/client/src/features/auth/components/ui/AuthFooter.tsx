import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// importing icons
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
// importing types
import type { AuthCaptionProps, AuthFooterProps, AuthProvidersProps, StyledAuthProviderButtonProps } from '../../types';
// importing hooks
import { useGoogle } from '../../hooks/useGoogle';
import { useFacebook } from '../../hooks/useFacebook';
// importing components
import { CenteredBox } from '../../../../components/CenteredBox';

export const AuthFooter = (props: AuthFooterProps) => {
    const { authMode, toggleAuthModal } = props;

    const { signUpWithGoogle } = useGoogle();
    const { signUpWithFacebook } = useFacebook();

    return (
        <>
            <AuthCaption
                authMode={authMode}
                toggleAuthModal={toggleAuthModal}
            />

            <CenteredBox sx={{ width: '100%', mt: 0.5, mb: 1.5 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant='body2' color='text.secondary' sx={{ px: 2 }}>
                    OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
            </CenteredBox>

            <AuthProviders
                signUpWithGoogle={signUpWithGoogle}
                signUpWithFacebook={signUpWithFacebook}
            />
        </>
    );
};

const AuthCaption = (props: AuthCaptionProps) => {
    const { authMode, toggleAuthModal } = props;

    return (
        <Typography component='span' variant='caption' color='text.secondary' sx={{ mt: 0.75 }}>
            {authMode === 'login' && `Don't`}
            {authMode === 'register' && 'Already'}
            {' '}have an account?{' '}

            <Typography
                component='span'
                variant='caption'
                color='primary'
                sx={{
                    cursor: 'pointer',
                    fontWeight: 'medium',
                    '&:hover': { color: 'primary.dark' },
                }}
                onClick={toggleAuthModal}
            >
                {authMode === 'login' && 'Create Account'}
                {authMode === 'register' && 'Log in'}
            </Typography>
        </Typography>
    );
};

const AuthProviders = (props: AuthProvidersProps) => {
    const { signUpWithGoogle, signUpWithFacebook } = props;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 1, width: '100%' }}>
            <StyledAuthProviderButton
                provider='Google'
                icon={<GoogleIcon fontSize='small' />}
                onClick={signUpWithGoogle}
                sx={{ bgcolor: '#DB4437' }}
            />

            <StyledAuthProviderButton
                provider='Facebook'
                icon={<FacebookIcon fontSize='small' />}
                onClick={signUpWithFacebook}
                sx={{ bgcolor: '#3b5998' }}
            />
        </CenteredBox>
    );
};

const StyledAuthProviderButton = (props: StyledAuthProviderButtonProps) => {
    const { provider, icon, sx, ...rest } = props;

    return (
        <Button
            variant='contained'
            sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'white', ...sx }}
            fullWidth
            {...rest}
        >
            {icon}
            <span>Continue with {provider}</span>
        </Button>
    );
};