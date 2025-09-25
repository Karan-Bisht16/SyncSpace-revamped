// importing types
import type { TypographyProps } from '@mui/material';

export type SectionHeadingProps = {
    text: string,
} & TypographyProps;

export type SectionSubHeadingProps = SectionHeadingProps;

export type SectionCaptionProps = SectionHeadingProps;