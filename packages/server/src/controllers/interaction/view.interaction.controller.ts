import { ApiResponse } from '@syncspace/shared';
// importing types
import type { SortOrder } from 'mongoose';
// importing models
import { Interaction } from '../../models/interaction.model.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { paginateAndSort } from '../../utils/paginateAndSort.util.js';
import { validateReqQuery } from '../../utils/validateReq.util.js';

export const fetchInteractions = asyncReqHandler(async (req) => {
    const { page, targets, sortOrder = 'asc' } = validateReqQuery(req);

    const { _id } = req.user;

    const result = await paginateAndSort(
        Interaction,
        {
            userId: _id,
            ...(targets ? { target: { $in: Array.isArray(targets) ? targets : [targets] } } : {})
        },
        { page: Number(page), limit: 10, sortOrder: sortOrder as SortOrder }
    );

    return new ApiResponse({
        code: 200,
        data: result,
        message: 'User interactions fetched successfully',
    });
});