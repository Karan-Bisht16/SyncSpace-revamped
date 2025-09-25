import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { GenericAuthModalProps } from '../types';
// importing contexts
import { useThemeContext } from '../contexts/theme.context';
// importing components
import { CenteredBox } from './CenteredBox';
import { LordIcon } from './LordIcon';

export const GenericAuthModal = (props: GenericAuthModalProps) => {
    const { heading, subHeading, lordicon, customIcon, children, sx, ...rest } = props;

    const { transitionDurationMs } = clientConfig;

    const { designTokens } = useThemeContext();

    return (
        <Box sx={{
            display: 'flex',
            width: '28vw',
            maxWidth: '540px',
            color: 'text.primary',
            bgcolor: 'background.paper',
            px: 2,
            py: 4,
            ...sx,
        }} {...rest}>
            <CenteredBox sx={{ flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
                    <CenteredBox sx={{
                        display: 'inline-flex',
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        mb: 1.25,
                        borderRadius: '50%',
                    }}>
                        {lordicon && (
                            <LordIcon
                                src={lordicon.src}
                                size={lordicon.size || '25px'}
                                trigger={lordicon.trigger || 'in'}
                                primary={lordicon.primary || designTokens?.palette?.primary?.contrastText}
                                secondary={lordicon.secondary || designTokens?.palette?.primary?.contrastText}
                                delay={lordicon.delay || transitionDurationMs}
                                stroke={lordicon.stroke || 'bold'}
                            />
                        )}
                        {customIcon}
                    </CenteredBox>
                    <Typography component='h3' variant='h5'>
                        {heading}
                    </Typography>
                    {subHeading && (
                        <Typography component='span' variant='caption' color='text.secondary'>
                            {subHeading}
                        </Typography>
                    )}
                </Box>
                {children}
            </CenteredBox>
        </Box>
    );
};