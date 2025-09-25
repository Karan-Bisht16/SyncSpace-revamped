import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const ProfileSetting = () => {
    return (
        <Stack spacing={3}>
            {/* TODO: show a real-time profile change */}

            <SectionSubHeading text='Update Profile Photo' />
            <SectionSubHeading text='Update bio' />
            <SectionSubHeading text='Update socials' />
            <SectionSubHeading text='Update banner' />
            
            <SectionSubHeading text='Update `mark as mature (18+)`' />
            <SectionSubHeading text='Update `Show followers`' />
            <SectionSubHeading text='Update `Content and Activity`' />
        </Stack>
    );
};