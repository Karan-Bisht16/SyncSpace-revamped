import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup, logout } from '../../user';
// importing types
import type { MouseEvent } from 'react';
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useProfileMenu = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user.user);
    const logoutStatus = useSelector((state: RootState) => state.user.status.logout);
    const logoutError = useSelector((state: RootState) => state.user.error.logout);

    const showErrorSnackBar = useErrorSnackBar();

    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleNavigateToProfile = () => {
        navigate(`/profile/${user.username}`);
        handleCloseMenu();
    };

    const handleLogout = async () => {
        dispatch(logout())
    };

    useEffect(() => {
        if (logoutStatus === 'succeeded') {
            handleCloseMenu();
            dispatch(cleanup('logout'));
            navigate('/');
        }
        
        if (logoutStatus === 'failed' && logoutError) {
            showErrorSnackBar(new ApiError(logoutError));
            dispatch(cleanup('logout'));
        }
    }, [logoutStatus, logoutError]);

    return {
        openMenu,
        anchorEl,
        handleOpenMenu,
        handleCloseMenu,
        handleNavigateToProfile,
        handleLogout,
    };
};