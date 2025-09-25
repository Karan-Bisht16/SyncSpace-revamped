// importing features
import { changePassword } from "../../setting";
// importing types
import type { AppDispatch } from "../../../types";
import type { UserReauthService } from "../types";
// importing thunks
import { deleteAccount } from "../features/account/account.user.thunk";
import { updateEmail } from "../features/profile/profile.user.thunk";
import { determineReauth } from "../features/session/session.user.thunk";

export const retryRegistry = {
    changePassword: (args) => changePassword(args),
    deleteAccount: (args, dispatch) => dispatch(deleteAccount(args)),
    determineReauth: (args, dispatch) => dispatch(determineReauth(args)),
    updateEmail: (args, dispatch) => dispatch(updateEmail(args)),
} as Record<UserReauthService, (args: any, dispatch: AppDispatch) => Promise<any>>;