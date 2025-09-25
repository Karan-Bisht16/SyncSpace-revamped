// importing types
import type { PaletteOptions } from '@mui/material';

export type ThemePreviewCardProps = {
    label: string,
    selected: boolean,
    theme: PaletteOptions | undefined,
    onSelect: () => void,
};