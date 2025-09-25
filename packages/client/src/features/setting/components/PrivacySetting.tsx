import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const PrivacySetting = () => {
    return (
        <Stack spacing={3}>
            <SectionSubHeading text='Update `Allow people to follow you`' />
            <SectionSubHeading text='Update `Who can send you message`' />
            <SectionSubHeading text='Update `Blocked accounts`' />
            <SectionSubHeading text='Update `Clear history?`' />
        </Stack>
    );
};