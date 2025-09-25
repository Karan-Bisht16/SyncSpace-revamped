// importing types
import type { Request } from 'express';
import type { RefreshTokenSchema, UserDocument } from '@syncspace/shared';

export type InitSessionTokensParams = {
    req: Request,
    user: UserDocument,
};

export type RenewSessionTokensParams = InitSessionTokensParams & {
    oldRefreshToken: RefreshTokenSchema,
    updateLastLogin?: boolean,
};