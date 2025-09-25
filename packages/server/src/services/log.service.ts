// importing types
import type { LogToDbParams } from '../types/index.js';
// importing models
import { Error } from '../models/error.model.js';
import { Interaction } from '../models/interaction.model.js';
// importing libs
import { getIp, getOrigin, getRoute, getUserAgent } from '../lib/uaParser.lib.js';

export const logToDb = async (params: LogToDbParams) => {
    const { type, payload } = params;

    try {
        if (type === 'interaction') {
            return await Interaction.create(payload);
        }
        if (type === 'error') {
            const { req, description, userId, stack } = payload;

            const route = getRoute(req);
            const origin = getOrigin(req);
            const userAgent = getUserAgent(req);
            const ip = getIp(req);

            await Error.updateOne({
                route,
                description,
                'meta.origin': origin,
            }, {
                $set: {
                    userId,
                    'meta.origin': origin,
                    'meta.userAgent': userAgent,
                    'meta.ip': ip,
                    'meta.stack': stack,
                },
                $inc: { count: 1 },
            }, { upsert: true });
        };
    } catch (error) {
        console.error('Logging operation failed: ', error);
    }
};