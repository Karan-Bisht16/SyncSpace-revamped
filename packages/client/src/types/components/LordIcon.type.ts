export type LordIconTrigger = 'in' | 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang';

export type LordIconStroke = 'light' | 'bold';

export type LordIconProps = {
    src: string,
    size: string,
    trigger: LordIconTrigger,
    primary: string,
    secondary: string,
    delay?: number,
    stroke?: LordIconStroke,
};