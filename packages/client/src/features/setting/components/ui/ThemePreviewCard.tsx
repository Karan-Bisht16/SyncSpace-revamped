import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
// importing types
import type { ThemePreviewCardProps } from '../../types';
// importing components
import { CenteredBox } from '../../../../components/CenteredBox';

export const ThemePreviewCard = (props: ThemePreviewCardProps) => {
    const { label, selected, theme, onSelect } = props;

    if (!theme) return null;

    const borderColor = selected ? 'primary.main' : 'divider';
    const bgPaper = theme.background!.paper;
    const bgDefault = theme.background!.default;
    const primaryMain = (theme.primary as { main: string }).main;
    const divider = theme.divider;
    const textPrimary = theme.text!.primary;
    const textSecondary = theme.text!.secondary;

    return (
        <Box>
            <CenteredBox
                onClick={onSelect}
                sx={{
                    flexDirection: 'column',
                    gap: 0.5,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: bgDefault,
                    p: 1,
                    border: '2px solid',
                    borderColor,
                    borderRadius: 2,
                    boxShadow: selected ? 3 : 1,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.light' },
                }}
            >
                <CenteredBox sx={{ justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <CenteredBox sx={{ gap: 0.5, width: '20%' }}>
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                    </CenteredBox>
                    <Box sx={{ height: 12, width: '40%', bgcolor: bgDefault, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                    <CenteredBox sx={{ gap: 0.5, width: '25%' }}>
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgDefault, border: '1px solid', borderColor: textPrimary, borderRadius: '2px' }} />
                        <Box sx={{ height: 12, width: '50%', bgcolor: primaryMain, borderRadius: '2px' }} />
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{ height: 12, width: 12, bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: '50%' }} />
                            <Box sx={{ height: 4, width: 4, position: 'absolute', top: 0, right: 0, bgcolor: primaryMain, borderRadius: '50%' }} />
                        </Box>
                    </CenteredBox>
                </CenteredBox>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '20%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '45%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '10%', borderRadius: 1, mb: 0.5 }} />
                </Box>
                <CenteredBox sx={{ gap: 0.5, width: '100%', mb: 2 }}>
                    <Box
                        sx={{
                            flexGrow: 1,
                            height: 16,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '2px',
                        }}
                    />
                    <Box sx={{ height: 16, width: 32, bgcolor: primaryMain, borderRadius: '2px' }} />
                </CenteredBox>
                <CenteredBox sx={{ gap: 0.5 }}>
                    <Box sx={{ height: 10, width: 20, bgcolor: primaryMain, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                    <Box sx={{ height: 10, width: 20, bgcolor: bgPaper, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                    <Box sx={{ height: 10, width: 20, bgcolor: bgPaper, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                </CenteredBox>
            </CenteredBox>

            <CenteredBox sx={{ justifyContent: 'flex-start' }}>
                <Radio
                    checked={selected}
                    onChange={onSelect}
                    value={label}
                />
                <Typography
                    variant='body1'
                    sx={{ color: selected ? 'primary.main' : 'text.secondary' }}
                >
                    {label.charAt(0).toUpperCase()}{label.substring(1)}
                </Typography>
            </CenteredBox>
        </Box>
    );
};