// importing types
import type { SwitchProps } from '@mui/material';

export type SettingCheckBoxProps = {
    label: string,
    name: string,
    description?: string,
    disabled?: boolean,
} & SwitchProps;