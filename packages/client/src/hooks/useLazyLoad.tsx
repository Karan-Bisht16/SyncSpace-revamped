import { Suspense } from 'react';
// importing types
import type { JSX, LazyExoticComponent, ReactNode } from 'react';
// importing components
import { CenteredBox } from '../components/CenteredBox';

export const useLazyLoad = () => {
    const Load = (
        Component: LazyExoticComponent<() => JSX.Element>,
        fallback?: ReactNode,
    ) => {
        if (!fallback) {
            fallback = (
                <CenteredBox sx={{ height: '100vh', width: '100vw', color: 'text.primary', bgcolor: 'background.default' }}>
                    Loading Page...
                </CenteredBox>
            );
        }

        return (
            <Suspense fallback={fallback} >
                <Component />
            </Suspense>
        );
    };
    return Load;
};