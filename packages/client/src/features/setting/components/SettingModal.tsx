import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// importing icons
import ResetIcon from '@mui/icons-material/RestartAlt';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
import type { ResetSettingButtonProps } from '../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
import { useSettingModal } from '../hooks/useSettingModal';
import { useSettingSections } from '../hooks/useSettingSection';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { AccountSetting } from './AccountSetting';
import { KeyBindingsSettings } from './KeyBindingsSettings';
import { NotificationSetting } from './NotificationSetting';
import { PreferencesSetting } from './PreferencesSetting';
import { PrivacySetting } from './PrivacySetting';
import { ProfileSetting } from './ProfileSetting';

export const SettingModal = () => {
    const { settingsSidebarWidthPx, transitionDurationMs } = clientConfig;

    const dispatch = useDispatch<AppDispatch>();

    const updateSettingStatus = useSelector((state: RootState) => state.user.status.updateSetting);
    const updateSettingError = useSelector((state: RootState) => state.user.error.updateSetting);
    const resetSettingStatus = useSelector((state: RootState) => state.user.status.resetSetting);
    const resetSettingError = useSelector((state: RootState) => state.user.error.resetSetting);
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const showErrorSnackBar = useErrorSnackBar();
    const isMobile = useMobile();
    const { sections, activeSection, handleSectionChange } = useSettingSections();
    const { closeResetSettingModal } = useSettingModal();

    let filteredSections = sections;
    if (!isLoggedIn) {
        filteredSections = filteredSections.filter((section) => !section.authRequired);
    }

    useEffect(() => {
        if (updateSettingStatus === 'succeeded') {
            setTimeout(() => {
                dispatch(cleanup('updateSetting'));
            }, transitionDurationMs)
        }

        if (updateSettingStatus === 'failed' && updateSettingError) {
            showErrorSnackBar(new ApiError(updateSettingError));
            dispatch(cleanup('updateSetting'));
        }
    }, [updateSettingStatus, updateSettingError]);

    useEffect(() => {
        if (resetSettingStatus === 'succeeded') {
            closeResetSettingModal();
            setTimeout(() => {
                dispatch(cleanup('resetSetting'));
            }, transitionDurationMs)
        }

        if (resetSettingStatus === 'failed' && resetSettingError) {
            showErrorSnackBar(new ApiError(resetSettingError));
            dispatch(cleanup('resetSetting'));
        }
    }, [resetSettingStatus, resetSettingError]);

    return (
        <Box sx={{ height: '80vh', width: '70vw', maxWidth: '1080px' }}>
            <Typography variant='h5' sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                Settings
            </Typography>

            <Box sx={{ display: 'flex', height: 'calc(100% - 65px)', position: 'relative' }}>
                <Box
                    sx={{
                        height: '100%',
                        width: isMobile ? 72 : settingsSidebarWidthPx,
                        minWidth: isMobile ? 72 : settingsSidebarWidthPx,
                        overflow: 'auto',
                        position: 'relative',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                    }}
                >
                    <List component='nav' sx={{ p: 1 }}>
                        {filteredSections.map((section) => (
                            <ListItem key={section.id} disablePadding>
                                <ListItemButton
                                    selected={activeSection === section.id}
                                    onClick={() => handleSectionChange(section.id)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': { backgroundColor: 'action.selected' },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                                    {!isMobile && <ListItemText primary={section.label} />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <ResetSettingButton
                        startIcon={<ResetIcon />}
                        sx={{ display: { xs: 'none', md: 'flex' }, width: '93%' }}
                    >
                        Reset Settings
                    </ResetSettingButton>

                    <ResetSettingButton sx={{ display: { xs: 'block', md: 'none' }, width: '64px !important' }}>
                        <ResetIcon />
                    </ResetSettingButton>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                    {activeSection === 'preferences' && <PreferencesSetting />}
                    {activeSection === 'profile' && <ProfileSetting />}
                    {activeSection === 'account' && <AccountSetting />}
                    {activeSection === 'notification' && <NotificationSetting />}
                    {activeSection === 'privacy' && <PrivacySetting />}
                    {activeSection === 'keybindings' && <KeyBindingsSettings />}
                </Box>

                {(updateSettingStatus === 'loading' || updateSettingStatus === 'succeeded') &&
                    <CenteredBox sx={{ gap: 0.75, position: 'absolute', bottom: '12px', right: '24px', color: 'text.secondary' }}>
                        {updateSettingStatus === 'loading' && <CircularProgress size='16px' color='inherit' />}
                        <Typography variant='caption' sx={{ fontSize: '14px' }}>
                            {updateSettingStatus === 'succeeded' && 'Saved'}
                            {updateSettingStatus === 'loading' && 'Saving...'}
                        </Typography>
                    </CenteredBox>
                }
            </Box>
        </Box>
    );
};

const ResetSettingButton = (props: ResetSettingButtonProps) => {
    const { children, sx, ...rest } = props;

    const { openResetSettingModal } = useSettingModal();

    return (
        <Button
            variant='contained'
            onClick={openResetSettingModal}
            sx={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                py: 1,
                ...sx
            }}
            {...rest}
        >
            {children}
        </Button >
    );
};