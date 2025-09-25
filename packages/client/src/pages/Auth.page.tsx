import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
// importing features
import { AuthModal } from '../features/auth';
// importing types
import type { RootState } from '../types';
// importing components
import { CenteredBox } from '../components/CenteredBox';
import { PageBase } from '../components/PageBase';

const Auth = () => {
    const { mode } = useParams();

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn]);

    if (mode === 'login' || mode === 'register') {
        return (
            <PageBase sx={{ height: '100vh' }}>
                <CenteredBox>
                    <AuthModal key={mode} authMode={mode} fullPage={true} />
                </CenteredBox>
            </PageBase>
        );
    }

    return <Navigate to='/' replace />;
};

export default Auth;