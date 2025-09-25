import { UAParser } from 'ua-parser-js';
// importing types
import type { Request } from 'express';
import type { UserAgentSchema } from '@syncspace/shared';

export const getUserAgent = (req: Request) => {
    const parser = new UAParser(req.headers['user-agent']);
    const { ua, browser, device, os } = parser.getResult();

    return {
        raw: ua,
        browser: {
            name: browser.name,
            version: browser.version,
        },
        os: {
            name: os.name,
            version: os.version,
        },
        device: {
            type: device.type,
            model: device.model,
        },
    } as UserAgentSchema;
};

export const getRoute = (req: Request) => {
    return req.route?.path || req.originalUrl;
};

export const getIp = (req: Request) => {
    return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

export const getOrigin = (req: Request) => {
    return req.get('origin') || req.headers.origin;
};

export const getReferer = (req: Request) => {
    return req.get('referer') || req.headers.referer;
};