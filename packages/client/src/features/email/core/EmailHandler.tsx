import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
// importing icons
import ResetTokenExpiredIcon from '@mui/icons-material/CloseRounded';
// importing types
import type { EmailHandlerProps } from '../types';
// importing hooks
import { useDecodeToken } from '../hooks/useDecodeToken';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { GenericAuthModal } from '../../../components/GenericAuthModal';
import { LoadingModal } from '../../../components/LoadingModal';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { UpdateEmailPrompt } from '../components/UpdateEmailPrompt';
import { VerifyEmailPrompt } from '../components/VerifyEmailPrompt';

export const EmailHandler = (props: EmailHandlerProps) => {
    const { action, token } = props;

    const navigate = useNavigate();

    const { status } = useDecodeToken(action, token);

    if (status === 'loading') {
        return <LoadingModal loader={{ progress: 'linear', size: 360 }} children="Fetching..." />;
    }

    if (status === 'failed') {
        const actionLabel = action === 'resetPassword' ? 'password reset' :
            action === 'verifyEmail' ? 'email verification' :
                action === 'updateEmail' ? 'email update' :
                    'link';

        return (
            <GenericAuthModal
                heading="Link has expired"
                subHeading={`Your ${actionLabel} link is invalid or expired. Please retry the process to receive a new link.`}
                sx={{ p: 4, bgcolor: 'background.default' }}
                customIcon={<ResetTokenExpiredIcon />}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 1.25, width: '100%' }}>
                    <Button variant="contained" fullWidth onClick={() => navigate('/auth/login')}>
                        Go to Login
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </CenteredBox>
            </GenericAuthModal>
        );
    }

    switch (action) {
        case 'resetPassword':
            return <ResetPasswordForm token={token} />;
        case 'updateEmail':
            return <UpdateEmailPrompt token={token} />;
        case 'verifyEmail':
            return <VerifyEmailPrompt token={token} />;
        default:
            return <Navigate to='/' replace />;
    }
};