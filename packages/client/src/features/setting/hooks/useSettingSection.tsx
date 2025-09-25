import { useState } from 'react';
// importing icons
import AccountSettingIcon from '@mui/icons-material/Person';
import KeyBindingSettingsIcon from '@mui/icons-material/Keyboard';
import NotificationSettingIcon from '@mui/icons-material/Notifications';
import PreferencesSettingIcon from '@mui/icons-material/Palette';
import PrivacySettingIcon from '@mui/icons-material/Shield';
import ProfileSettingIcon from '@mui/icons-material/AccountCircle';

export const useSettingSections = () => {
    const sections = [
        {
            id: 'preferences',
            label: 'Preferences',
            icon: <PreferencesSettingIcon />
        },
        {
            id: 'profile',
            authRequired: true,
            label: 'Profile',
            icon: <ProfileSettingIcon />
        },
        {
            id: 'account',
            authRequired: true,
            label: 'Account',
            icon: <AccountSettingIcon />
        },
        {
            id: 'notifications',
            authRequired: true,
            label: 'Notifications',
            icon: <NotificationSettingIcon />
        },
        {
            id: 'privacy',
            authRequired: true,
            label: 'Privacy',
            icon: <PrivacySettingIcon />
        },
        {
            id: 'keybindings',
            label: 'Keyboard Shortcuts',
            icon: <KeyBindingSettingsIcon />
        },
    ];

    const [activeSection, setActiveSection] = useState('preferences');

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    return { sections, activeSection, handleSectionChange };
};