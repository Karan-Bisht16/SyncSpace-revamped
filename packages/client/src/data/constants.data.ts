export const clientConfig = {
    websiteName: 'SyncSpace',
    localStorageKey: 'syncspace-settings',
    transitionDurationMs: 600,
    mobileBreakpointPx: 768,
    snackbarTimeOutMs: 3000,

    debounce: {
        textField: 600,
        chipSelection: 400,
    },

    navbarHeightPx: 64,
    settingsSidebarWidthPx: 240,

    authPathRegex: /^\/auth\/(login|register)$/,
};