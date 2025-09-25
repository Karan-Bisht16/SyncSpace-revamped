// importing types
import type { ApiError, ApiResponse } from "@syncspace/shared";

export const reauthCallbackRegistry = new Map<
    string,
    {
        onSuccess?: (response: ApiResponse) => void | Promise<void>;
        onError?: (error: ApiError) => void | Promise<void>
    }
>();