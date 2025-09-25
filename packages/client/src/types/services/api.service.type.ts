// importing types
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@syncspace/shared';

export type ApiCall = () => Promise<AxiosResponse<ApiResponse>>;

export type ApiCallStatus = 'idle' | 'loading' | 'succeeded' | 'failed';