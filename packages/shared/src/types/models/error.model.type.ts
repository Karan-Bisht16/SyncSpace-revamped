// importing types
import type { ObjectId } from 'mongoose';
import type { UserAgentSchema } from './schemas/userAgent.schema.type.js';

export type ErrorBase = {
    route: string,
    description: string,
    count: number,
    userId?: ObjectId,
    meta: {
        origin: string,
        userAgent: UserAgentSchema,
        ip: string,
        stack?: any,
    }
};

export type ErrorDocument = Document & ErrorBase;