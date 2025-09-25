import { useSelector } from 'react-redux';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// importing icons
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileIcon from '@mui/icons-material/Person';
// importing types
import type { RootState } from '../../../types';
// importing hooks
import { useProfileMenu } from '../hooks/useProfileMenu';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { ToolTip } from '../../../components/ToolTip';

export const ProfileMenu = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const logoutStatus = useSelector((state: RootState) => state.user.status.logout);

    const {
        openMenu,
        anchorEl,
        handleOpenMenu,
        handleCloseMenu,
        handleNavigateToProfile,
        handleLogout,
    } = useProfileMenu();

    return (
        <>
            <CenteredBox sx={{ textAlign: 'center' }}>
                <ToolTip title='Open Profile Menu'>
                    <IconButton size='small' onClick={handleOpenMenu}>
                        <Avatar
                            sx={{
                                height: '32px',
                                width: '32px',
                                color: 'primary.contrastText',
                                bgcolor: 'primary.main',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                '&:hover': { borderColor: 'primary.dark' }
                            }}
                            src={user.profilePic && user.profilePic.lowRes.url}
                        >
                            {user.username.charAt(0)}
                        </Avatar>
                    </IconButton>
                </ToolTip>
            </CenteredBox>
            <Menu
                anchorEl={anchorEl}
                id='account-menu'
                open={openMenu}
                onClose={handleCloseMenu}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: `''`,
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                    list: {
                        sx: { py: 0 },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <MenuItem onClick={handleNavigateToProfile}>
                    <ListItemIcon>
                        <ProfileIcon fontSize='small' />
                    </ListItemIcon>
                    Profile
                </MenuItem>

                <Divider sx={{ m: '0px !important' }} />

                <MenuItem onClick={handleLogout} sx={{ position: 'relative' }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize='small' />
                    </ListItemIcon>
                    Logout
                    {logoutStatus === 'loading' &&
                        <LinearProgress sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%' }} />
                    }
                </MenuItem>
            </Menu>
        </>
    );
};