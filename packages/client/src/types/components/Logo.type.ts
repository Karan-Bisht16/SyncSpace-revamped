export type LogoSvgProps = {
    size?: string,
    primary?: string,
    secondary?: string,
    border?: string,
};

export type LogoTextProps = {
    text: {
        size?: string,
        color?: string,
        content: string,
    },
};

export type LogoProps = {
    logo?: {
        hide?: boolean,
        size: string,
        color: {
            primary: string,
            secondary: string,
            border: string,
        },
    },
    text?: {
        hide?: boolean,
        color: string,
    },
    sx?: object,
};