import { useDispatch, useSelector } from 'react-redux';
import { Themes } from '@syncspace/shared';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// importing features
import { optimisticUpdateSetting, updateSetting } from '../../user';
// importing types
import type { FeedLayout, Theme } from '@syncspace/shared';
import type { AppDispatch, RootState } from '../../../types';
import type { FeedLayoutPreviewCardProps } from '../types';
// importing contexts
import { useThemeContext } from '../../../contexts/theme.context';
// importing components
import { SectionCaption, SectionHeading, SectionSubHeading } from './ui/SettingTypography';
import { ThemePreviewCard } from './ui/ThemePreviewCard';
import { SettingCheckBox } from './ui/SettingCheckBox';

export const PreferencesSetting = () => {
    const dispatch = useDispatch<AppDispatch>();

    const setting = useSelector((state: RootState) => state.user.user.setting);

    const { palette } = useThemeContext();

    const updateTheme = (theme: Theme) => {
        const updatedSetting = {
            ...setting,
            startupSetting: { ...setting.startupSetting, theme },
        };

        dispatch(optimisticUpdateSetting(updatedSetting));
        dispatch(updateSetting({ newSetting: updatedSetting }));
    };

    const updateFeedLayout = (feedLayout: FeedLayout) => {
        const updatedSetting = {
            ...setting,
            startupSetting: { ...setting.startupSetting, feedLayout },
        };

        dispatch(optimisticUpdateSetting(updatedSetting));
        dispatch(updateSetting({ newSetting: updatedSetting }));
    };

    return (
        <Stack spacing={3}>
            <SectionHeading text='Preferences' />
            <Box>
                <SectionSubHeading text='Theme' />
                <SectionCaption text='Personalize your experience with themes that match your style.' />

                <Grid container spacing={2}>
                    {Themes.map((theme, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ThemePreviewCard
                                label={theme}
                                selected={setting.startupSetting.theme === theme}
                                theme={palette[theme as Theme]}
                                onSelect={() => updateTheme(theme as Theme)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <SettingCheckBox label='Show mature content' name='startupSetting.showMature' description='Allow posts marked as mature to appear in your feed.' />
            {/* TODO: When showMature is false then disable blurMature */}
            <SettingCheckBox label='Blur mature content' name='startupSetting.blurMature' description='Automatically blur images and thumbnails for mature posts until you choose to view them.' />

            <SectionSubHeading text='Update `Muted communities`' />

            <SettingCheckBox label='Autoplay media' name='startupSetting.autoplayMedia' description='Play videos automatically while scrolling through your feed.' />
            <SettingCheckBox label='Open post in new tab' name='startupSetting.openPostNewTab' description='Open posts in a separate browser tab instead of the current one.' />

            <Box>
                <SectionSubHeading text='Feed Layout' />
                <SectionCaption text='Personalize your experience with appropriate feed layout that match your style.' />

                <Grid container spacing={2}>
                    <FeedLayoutPreviewCard
                        feedLayout='card'
                        heading='Card Layout'
                        caption='Spacious design, great for browsing casually.'
                        setting={setting}
                        n={2}
                        onClickFunction={() => updateFeedLayout('card')}
                    />

                    <FeedLayoutPreviewCard
                        feedLayout='compact'
                        heading='Compact Layout'
                        caption='Condensed view, optimized for fast information.'
                        setting={setting}
                        n={4}
                        onClickFunction={() => updateFeedLayout('compact')}
                    />
                </Grid>
            </Box>
        </Stack>
    );
};

const FeedLayoutPreviewCard = (props: FeedLayoutPreviewCardProps) => {
    const { feedLayout, heading, caption, setting, n, onClickFunction } = props;

    return (
        <Grid size={{ xs: 12, lg: 6 }} onClick={onClickFunction}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    border: '2px solid',
                    borderColor: setting.startupSetting.feedLayout === feedLayout ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.light' },
                }}
            >
                <Box>
                    <SectionSubHeading text={heading} />
                    <SectionCaption text={caption} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: 120, mt: 2 }}>
                    {LayoutBars(n)}
                </Box>
            </Box>
        </Grid>
    );
};

const LayoutBars = (n?: number) => {
    const Bar = () => <Box sx={{ bgcolor: 'grey.200', height: '100%', borderRadius: 1 }} />

    if (!n) {
        return <Bar />;
    }

    return (
        <>
            {Array.from({ length: n }, (_, i) => (
                <Bar key={i} />
            ))}
        </>
    );
};