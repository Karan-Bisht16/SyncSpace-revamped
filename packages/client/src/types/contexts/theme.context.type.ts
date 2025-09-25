// importing types
import type { Theme as MuiTheme, PaletteOptions } from '@mui/material';
import type { Theme } from '@syncspace/shared';

export type ThemeContextType = {
    theme: Theme,
    palette: Record<Theme, PaletteOptions>,
    designTokens: MuiTheme,
};