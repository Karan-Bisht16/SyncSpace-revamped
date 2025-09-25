// importing types
import type { Request } from 'express';
import type { Schema } from 'mongoose';
import type { InteractionBase } from '@syncspace/shared';

export const LogTypes = ['interaction', 'error'] as const;
export type LogType = typeof LogTypes[number];

export type LogToDbParams = {
    type: 'interaction',
    payload: InteractionBase,
} | {
    type: 'error',
    payload: {
        req: Request,
        description: string,
        userId?: Schema.Types.ObjectId,
        stack?: any,
    },
};