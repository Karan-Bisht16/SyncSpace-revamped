// importing types
import type { TokenAction } from "@syncspace/shared";
import type { JwtFieldTypes } from "../types/index.js";

export const tokenRegistry: Record<TokenAction, JwtFieldTypes> = {
    resetPassword: { _id: 'string' },
    updateEmail: { _id: 'string', newEmail: 'string' },
    verifyEmail: { _id: 'string', email: 'string' },
};