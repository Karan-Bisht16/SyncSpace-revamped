import { createContext, useMemo, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { defaultStartupSetting } from '@syncspace/shared';
// importing types
import type { ContextProviderProps, RootState, ThemeContextType } from '../types';
import type { Theme as MuiTheme, PaletteOptions } from '@mui/material';
import type { Theme } from '@syncspace/shared';

const ThemeContext = createContext<ThemeContextType>({
    theme: defaultStartupSetting.theme,
    palette: {} as Record<Theme, PaletteOptions>,
    designTokens: {} as MuiTheme,
});
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const setting = useSelector((state: RootState) => state.user.user.setting);
    const theme = setting.startupSetting.theme;

    const themeOptions = useMemo(() => ({
        theme,
        palette,
        designTokens: getDesignTokens(theme),
    }), [theme]);

    const providerTheme = useMemo(() => {
        return createTheme(getDesignTokens(theme));
    }, [theme]);

    useEffect(() => {
        const meta = document.querySelector(`meta[name='color-scheme']`);
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={themeOptions}>
            <MuiThemeProvider theme={providerTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

const BaseTheme = {
    common: {
        black: '#000000',
        white: '#ffffff',
    },
    error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#ffa726',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#ffffff',
    },
    success: {
        main: '#66bb6a',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
        contrastText: '#ffffff',
    },
    grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
};

const palette = {
    'light': {
        mode: 'light',
        primary: {
            main: '#673ab7',
            light: '#8561c5',
            dark: '#482880',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#d500f9',
            light: '#dd33fa',
            dark: '#9500ae',
            contrastText: '#ffffff',
        },
        divider: '#424242',
        text: {
            primary: '#000000',
            secondary: '#474646',
            disabled: '#898989',
        },
        background: {
            paper: '#fafafa',
            default: '#eeeeee',
        },
    },
    'dark': {
        mode: 'dark',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00b0ff',
            light: '#33bfff',
            dark: '#007bb2',
            contrastText: '#ffffff',
        },
        divider: '#2f2f2f',
        text: {
            primary: '#ffffff',
            secondary: '#b8b8b8',
            disabled: '#898989',
        },
        background: {
            paper: '#121212',
            default: '#000000',
        },
    },
    'retro': {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00b0ff',
            light: '#33bfff',
            dark: '#007bb2',
            contrastText: '#ffffff',
        },
        divider: '#424242',
        text: {
            primary: '#000000',
            secondary: '#474646',
            disabled: '#0090c1',
        },
        background: {
            paper: '#fafafa',
            default: '#eeeeee',
        },
    },
} as Record<Theme, PaletteOptions>;

const getDesignTokens = (theme: Theme): MuiTheme => createTheme({
    palette: {
        ...(palette[theme] as PaletteOptions),
        ...(BaseTheme as PaletteOptions),
    },
    typography: {
        caption: {
            letterSpacing: '-0.1px',
        }
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        fontWeight: 300,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontWeight: 350,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 350,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: '2px !important',
                },
                bar1Indeterminate: {
                    animationDuration: '1s',
                },
                bar2Indeterminate: {
                    animationDuration: '1s',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    paddingTop: '8px',
                    paddingBottom: '8px',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontWeight: 350,
                },
            },
        },
    },
    zIndex: {
        mobileStepper: 100,
        fab: 105,
        speedDial: 105,
        appBar: 110,
        drawer: 120,
        modal: 130,
        snackbar: 140,
        tooltip: 150,
    },
});