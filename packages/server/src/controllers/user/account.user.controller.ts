import {
    ApiError,
    ApiResponse,
    defaultSetting,
    validateAll,
    validateSetting,
} from '@syncspace/shared';
// importing config
import { COOKIES_OPTION } from '../../data/constants.js';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { deleteFilesFromCloudinary } from '../../lib/cloudinary.lib.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    AccountUserControllerResponses as responses,
} from '../../responses/index.js';

export const updateSetting = asyncReqHandler(async (req) => {
    const { newSetting } = validateReqBody(req);
    const { updateSetting: settingRes } = responses;

    const validation = validateAll(validateSetting(newSetting));
    if (validation !== true) {
        throw new ApiError({ ...settingRes.validationFailure, message: validation.message });
    }

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        { $set: { setting: newSetting } }
    );

    return new ApiResponse({ ...settingRes.success, data: newSetting });
});

export const resetSetting = asyncReqHandler(async (req) => {
    const { resetSetting: settingRes } = responses;

    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        { $set: { setting: defaultSetting } }
    );

    return new ApiResponse({ ...settingRes.success, data: defaultSetting });
});

export const deleteAccount = asyncReqHandler(async (req, res) => {
    const { deleteAccount: deleteRes } = responses;

    const { _id, email, profilePic, banner } = req.user;

    const keep = [
        'auth.authProvider',
        'auth.isEmailVerified',
        'auth.refreshTokens',
        'deleted.email',
        'deleted.isDeleted',
        'socials',
        'username',
    ];

    const allPaths = Object.keys(User.schema.paths);

    const unsetFields = allPaths
        .filter((path) => !keep.includes(path) && !['_id', 'createdAt', 'updatedAt', '__v'].includes(path))
        .reduce((acc, path) => {
            acc[path] = '';
            return acc;
        }, {} as Record<string, string>);

    if (profilePic) {
        const { highRes, lowRes } = profilePic;
        await deleteFilesFromCloudinary({ publicIds: [highRes?.publicId, lowRes?.publicId].filter(Boolean) });
    }
    if (banner) {
        const { highRes, lowRes } = banner;
        await deleteFilesFromCloudinary({ publicIds: [highRes?.publicId, lowRes?.publicId].filter(Boolean) });
    }

    const user = await User.findByIdAndUpdate(_id, {
        $set: {
            'deleted.isDeleted': true,
            'deleted.email': email,
        },
        $unset: unsetFields,
    }, { new: true });

    res.clearCookie('refreshToken', COOKIES_OPTION);
    req.user = user;

    return new ApiResponse(deleteRes.success);
}, {
    action: 'account-deactivated',
    target: 'account',
    description: 'Account deleted',
});