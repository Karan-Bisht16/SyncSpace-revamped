import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// importing components
import { HotkeyDisplay } from './ui/HotkeyDisplay';
import { SectionHeading, SectionSubHeading } from './ui/SettingTypography';

{/* TODO: map the key bindings for both windows and mac */ }
export const KeyBindingsSettings = () => {
    return (
        <Stack spacing={4}>
            <SectionHeading text='Keyboard Shortcuts' />

            <Box>
                <SectionSubHeading text='Application' />
                <Stack spacing={0.5}>
                    <HotkeyDisplay text='Open Settings' binding='Ctrl + ,' />
                    <HotkeyDisplay text='Focus Search' binding='Ctrl + `' last={true} />
                </Stack>
            </Box>
        </Stack>
    );
};