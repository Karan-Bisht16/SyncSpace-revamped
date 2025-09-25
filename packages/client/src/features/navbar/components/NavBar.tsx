import { useSelector } from 'react-redux';
import { Link as NavigateLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing features
import { useSettingModal } from '../../setting';
// importing types
import type { RootState } from '../../../types';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { Logo } from '../../../components/Logo';
import { ToolTip } from '../../../components/ToolTip';
import { AuthActions } from './AuthActions';
import { ProfileMenu } from './ProfileMenu';
import { SearchBar } from './SearchBar';

export const NavBar = () => {
    const { navbarHeightPx } = clientConfig;

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const { openSettingModal } = useSettingModal();

    return (
        <CenteredBox sx={{
            justifyContent: 'space-between',
            height: `${navbarHeightPx}px`,
            width: '100%',
            position: 'fixed',
            top: 0, 
            px: 4,
            color: 'text.primary',
            bgcolor: 'background.default',
        }}>
            <CenteredBox sx={{ justifyContent: 'start', width: '25%' }}>
                <NavigateLink to='/'>
                    <Logo />
                </NavigateLink>
            </CenteredBox>

            <SearchBar sx={{ width: '50%', }} />

            <CenteredBox sx={{ justifyContent: 'end', width: '25%', gap: 1 }}>
                {isLoggedIn
                    ? <ProfileMenu />
                    : <AuthActions />
                }
                <ToolTip title='Settings'>
                    <IconButton onClick={openSettingModal}>
                        <SettingsIcon fontSize='small' />
                    </IconButton>
                </ToolTip>
            </CenteredBox>
        </CenteredBox>
    );
};