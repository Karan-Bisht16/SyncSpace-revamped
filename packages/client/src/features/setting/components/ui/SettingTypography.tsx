import Typography from '@mui/material/Typography';
// importing types
import type { SectionCaptionProps, SectionHeadingProps, SectionSubHeadingProps } from '../../types';

export const SectionHeading = (props: SectionHeadingProps) => {
    const { text, ...rest } = props;

    return (
        <Typography variant='h6' component='h6' {...rest}>
            {text}
        </Typography>
    );
};

export const SectionSubHeading = (props: SectionSubHeadingProps) => {
    const { text, ...rest } = props;

    return (
        <Typography variant='subtitle2' {...rest}>
            {text}
        </Typography>
    );
};

export const SectionCaption = (props: SectionCaptionProps) => {
    const { text, sx, ...rest } = props;

    return (
        <Typography variant='subtitle1' color='text.secondary' fontSize='small' sx={{ mb: 1.5, ...sx }} {...rest}>
            {text}
        </Typography>
    );
};