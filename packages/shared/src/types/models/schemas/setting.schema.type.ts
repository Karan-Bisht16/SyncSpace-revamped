export const FeedLayouts = ['card', 'compact'] as const;
export type FeedLayout = typeof FeedLayouts[number];

export const Themes = ['light', 'dark', 'retro'] as const;
export type Theme = typeof Themes[number];

export type StartupSetting = {
    theme: Theme,
    feedLayout: FeedLayout,
    showMature: boolean,
    blurMature: boolean,
    autoplayMedia: boolean,
    openPostNewTab: boolean,
};

export type GeneralSetting = {
    markMature: boolean,
    showFollowers: boolean,
    allowFollow: boolean,
    pauseHistory: boolean,
};

export type SettingSchema = {
    startupSetting: StartupSetting,
    generalSetting?: GeneralSetting,
};

export const defaultStartupSetting: StartupSetting = {
    theme: 'dark',
    feedLayout: 'card',
    showMature: false,
    blurMature: true,
    autoplayMedia: false,
    openPostNewTab: false,
};

export const defaultGeneralSetting: GeneralSetting = {
    markMature: false,
    showFollowers: true,
    allowFollow: true,
    pauseHistory: false,
};

export const defaultSetting: SettingSchema = {
    startupSetting: defaultStartupSetting,
    generalSetting: defaultGeneralSetting,
};