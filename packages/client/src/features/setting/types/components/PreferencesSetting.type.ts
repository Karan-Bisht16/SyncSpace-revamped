// importing types
import type { FeedLayout, SettingSchema } from '@syncspace/shared';

export type FeedLayoutPreviewCardProps = {
    feedLayout: FeedLayout,
    heading: string,
    caption: string,
    setting: SettingSchema,
    n: number,
    onClickFunction: () => void,
};