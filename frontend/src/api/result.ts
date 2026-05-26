import type {ApiResponse} from "./client.ts";

export const RESULT_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
} as const

export type ResultStatus = typeof RESULT_STATUS[keyof typeof RESULT_STATUS]

export type ResultState<T> =
    | { status: typeof RESULT_STATUS.IDLE; message?: string }
    | { status: typeof RESULT_STATUS.LOADING; message?: string }
    | { status: typeof RESULT_STATUS.ERROR; message?: string }
    | { status: typeof RESULT_STATUS.SUCCESS; message?: string; data: ApiResponse<T> | null | undefined }