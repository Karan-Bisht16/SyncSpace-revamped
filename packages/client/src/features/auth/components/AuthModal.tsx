import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// importing types
import type { AuthModalProps, AuthMode } from '../types';
// importing components
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
// importing assets
import authBgImg from '/assets/img-bg-register-6.png';

export const AuthModal = (props: AuthModalProps) => {
    const { authMode: propsAuthMode, fullPage } = props;

    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>(propsAuthMode);

    const toggleAuthModal = () => {
        const newAuthMode = authMode === 'login' ? 'register' : 'login';

        if (fullPage) {
            return navigate(`/auth/${newAuthMode}`);
        }

        setAuthMode(newAuthMode);
    };

    const width = authMode === 'login' ? '30vw' : '75vw';
    const maxWidth = authMode === 'login' ? '560px' : '1080px';

    return (
        <Box sx={{
            display: 'flex',
            maxHeight: '90vh',
            width,
            maxWidth,
            color: 'text.primary',
            bgcolor: fullPage ? 'background.default' : 'background.paper',
            p: 6,
        }}>
            {authMode === 'register' &&
                <Box sx={{ display: 'flex', gap: 8, alignSelf: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1, background: `center / contain no-repeat url(${authBgImg})` }}>
                        <Typography
                            variant='h3'
                            component='h2'
                            sx={{ fontWeight: 'bold', textShadow: '1px 1px 4px rgba(0, 0, 255, 0.65)' }}
                        >
                            Explore interests.
                            <br />
                            Share ideas.
                            <br />
                            Be heard.
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <RegisterForm toggleAuthModal={toggleAuthModal} />
                    </Box>
                </Box>
            }

            {authMode === 'login' && <LoginForm toggleAuthModal={toggleAuthModal} />}
        </Box>
    );
};