import { createElement } from 'react';
// importing types
import type { LordIconProps } from '../types';

export const LordIcon = (props: LordIconProps) => {
    const { src, size, trigger, primary, secondary, delay, stroke } = props;

    const colors = `primary:${primary},secondary:${secondary}`;
    const style = { height: size, width: size };

    return createElement('lord-icon', {
        src,
        trigger,
        stroke,
        delay,
        colors,
        style,
    });
};