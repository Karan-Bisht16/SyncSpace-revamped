import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
// importing features
import { useAuthModal } from '../../auth';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing types
import type { StyledNavBarButtonProps } from '../types';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';

export const AuthActions = () => {
    const { openAuthModal } = useAuthModal();

    const { pathname } = useLocation();

    const { authPathRegex } = clientConfig;

    if (authPathRegex.test(pathname)) {
        return null;
    }

    return (
        <CenteredBox sx={{ gap: 2 }}>
            <StyledNavBarButton
                label='Log in'
                onClick={() => openAuthModal('login')}
                sx={{
                    color: 'text.primary',
                    px: 2,
                    border: '0.5px solid',
                    borderColor: 'text.secondary',
                }}
            />
            <StyledNavBarButton
                label='Register'
                variant='contained'
                color='primary'
                onClick={() => openAuthModal('register')}
            />
        </CenteredBox>
    );
};

const StyledNavBarButton = (props: StyledNavBarButtonProps) => {
    const { label, ...rest } = props;

    return (
        <Button size='small' {...rest} >
            {label}
        </Button>
    );
};