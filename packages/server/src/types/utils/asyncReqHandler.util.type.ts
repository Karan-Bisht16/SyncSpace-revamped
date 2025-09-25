// importing types
import type { NextFunction, Request, Response } from 'express';
import type { InteractionBase } from '@syncspace/shared';

export type AsyncReqHandlerParams = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<any>;

export type InteractionInfo =
    | Omit<InteractionBase, 'userId'>
    | null;

export type InteractionOption =
    | InteractionInfo
    | ((req: Request, resData: any) => InteractionInfo | Promise<InteractionInfo>);