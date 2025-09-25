import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// impoting types
import type { AuthHeaderProps } from '../../types';
// importing contexts
import { useThemeContext } from '../../../../contexts/theme.context';
// impoting components
import { CenteredBox } from '../../../../components/CenteredBox';
import { LordIcon } from '../../../../components/LordIcon';

export const AuthHeader = (props: AuthHeaderProps) => {
    const { lordIcon, heading, subHeading } = props;

    const { designTokens } = useThemeContext();

    const {
        src = 'https://cdn.lordicon.com/lltgvngb.json',
        trigger = 'hover',
        stroke = 'bold',
        delay,
        primary = designTokens?.palette?.primary?.contrastText,
        secondary = designTokens?.palette?.primary?.contrastText,
        size = '36px',
    } = lordIcon;

    return (
        <Box sx={{ textAlign: 'center' }}>
            <CenteredBox
                sx={{
                    display: 'inline-flex',
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    mb: 1.25,
                    borderRadius: '50%',
                }}
            >
                <LordIcon
                    src={src}
                    trigger={trigger}
                    stroke={stroke}
                    delay={delay}
                    primary={primary}
                    secondary={secondary}
                    size={size}
                />
            </CenteredBox>
            <Typography component='h3' variant='h5'>
                {heading}
            </Typography>
            <Typography component='span' variant='caption' color='text.secondary'>
                {subHeading}
            </Typography>
        </Box>
    );
}