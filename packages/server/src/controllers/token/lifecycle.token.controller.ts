import { ApiResponse } from "@syncspace/shared";
// importing types
import type { TokenAction } from "@syncspace/shared";
// importing libs
import { validateToken } from "../../lib/jwt.lib.js";
// importing utils
import { asyncReqHandler } from "../../utils/asyncReqHandler.util.js";
import { tokenRegistry } from "../../utils/tokenRegistry.util.js";
import { validateReqBody } from "../../utils/validateReq.util.js";
// importing responses
import {
    LifecycleTokenControllerResponses as responses,
} from '../../responses/index.js';

export const decodeToken = asyncReqHandler(async (req) => {
    const { action, token } = validateReqBody(req);
    const { decodeToken: decodeRes } = responses;

    await validateToken({
        action: action,
        token: token,
        fields: tokenRegistry[action as TokenAction],
    });

    return new ApiResponse(decodeRes.success);
});