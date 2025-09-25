// importing types
import type { TargetType } from '@syncspace/shared';

export type FetchInteractionsParams = {
    page: number,
    sortOrder: 'asc' | 'desc';
    targets?: TargetType | TargetType[],
};