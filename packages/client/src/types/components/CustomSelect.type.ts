// importing types
import type { SelectChangeEvent } from '@mui/material';

export type CustomSelectProps = {
    id: string,
    name: string,
    value: string,
    onChange(event: SelectChangeEvent): void,
    list: { value: string, label: string }[],
    label?: string,
    maxHeight?: string | number,
    disabled?: boolean,
};