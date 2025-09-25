import { scroller } from 'react-scroll';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { ScrollToParams } from '../types';

export const scrollTo = (params: ScrollToParams) => {
    const { to, duration, smooth = 'easeInOutQuad' } = params;

    const { transitionDurationMs } = clientConfig;

    scroller.scrollTo(to, {
        duration: duration ?? transitionDurationMs,
        smooth: smooth,
    });
};

export const linkTo = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '__blank';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};