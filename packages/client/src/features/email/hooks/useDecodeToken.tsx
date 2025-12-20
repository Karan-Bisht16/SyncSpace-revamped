import { useEffect, useState } from 'react';
import { ApiError, ApiResponse, TokenActions } from '@syncspace/shared';
// importing types
import type { TokenAction } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../types';
// importing services
import {
    decodeToken as decodeTokenService,
} from '../services/api.service';

export const useDecodeToken = (action: string, token: string) => {
    const [status, setStatus] = useState<ApiCallStatus>('loading');

    useEffect(() => {
        const decode = async (action: TokenAction) => {
            const response = await decodeTokenService({ action, token });

            if (response instanceof ApiError) {
                setStatus('failed');
            } else if (response instanceof ApiResponse) {
                setStatus('succeeded');
            }
        };

        if (TokenActions.includes(action as TokenAction)) {
            decode(action as TokenAction);
        } else {
            setStatus('failed');
        }
    }, [action, token]);

    return {
        status,
    };
};