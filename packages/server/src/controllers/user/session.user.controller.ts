import { ApiResponse } from '@syncspace/shared';
// importing types
import type { UserDocument } from '@syncspace/shared';
// importing services
import { getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
// importing responses 
import {
    SessionUserControllerResponses as responses,
} from '../../responses/index.js';

export const fetchSession = asyncReqHandler(async (req) => {
    const { fetchSession: sessionRes } = responses;
    
    const user = req.user as UserDocument;

    return new ApiResponse({ ...sessionRes.success, data: getUserState(user) });
});

export const determineReauth = asyncReqHandler(async () => {
    const { determineReauth: reauthRes } = responses;

    return new ApiResponse({ ...reauthRes.success, data: true });
});