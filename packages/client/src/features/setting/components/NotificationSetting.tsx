import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const NotificationSetting = () => {
    return (
        <Stack spacing={3}>
            <SectionSubHeading text='All of it from `https://www.reddit.com/settings/notifications`' />
        </Stack>
    );
};