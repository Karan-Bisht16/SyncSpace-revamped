import { AbstractTargetTypes, EntityTargetTypes } from '@syncspace/shared';
// importing types
import type { NextFunction, Request, Response } from 'express';
import type { InteractionBase } from '@syncspace/shared';
import type { AsyncReqHandlerParams, InteractionOption } from '../types/index.js';
// importing services
import { logToDb } from '../services/log.service.js';

export const asyncReqHandler = (
    reqHandler: AsyncReqHandlerParams,
    interaction?: InteractionOption,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await reqHandler(req, res, next);
            const responseCode = response.code || 200;
            const responseMessage = response.message || 'Request completed successfully.';

            res.status(responseCode).json({
                code: responseCode,
                success: response.success,
                partial: response.partial,
                message: responseMessage,
                data: response.data,
            });

            if (interaction && req.user?._id) {
                const resolvedInteraction = typeof interaction === 'function'
                    ? await interaction(req, response.data)
                    : interaction;

                if (!resolvedInteraction) {
                    return;
                }

                if (AbstractTargetTypes.includes(resolvedInteraction.target as any)) {
                    logToDb({
                        type: 'interaction',
                        payload: { ...resolvedInteraction, userId: req.user!._id } as InteractionBase,
                    });
                } else if (EntityTargetTypes.includes(resolvedInteraction.target as any)) {
                    // TODO: when pauseHistory then don't perform this 
                    logToDb({
                        type: 'interaction',
                        payload: { ...resolvedInteraction, userId: req.user!._id } as InteractionBase,
                    });
                }
            }
        } catch (error) {
            next(error);
        }
    };
};