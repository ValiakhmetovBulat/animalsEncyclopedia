import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios'
import {type RequestMethod, RequestMethods} from "./request_methods.ts";

export type ApiResponse<T> = {
    data: T | null
    success: boolean
    error: string
    message: string
}

export type AppResponse<T> = {
    ok: boolean,
    status: number,
    error?: string,
    data?: ApiResponse<T> | null
}

export type PaginatedResponse<T> = {
    total: number;
    data: T | null;
}

export const baseUrl = 'https://127.0.0.1:8080'

export const apiUrl = `${baseUrl}/api`

const apiHeaders = {
    'Content-Type': 'application/json',
}

const $api = axios.create({
    baseURL: apiUrl,
    headers: apiHeaders,
})

const authInterceptor = (config: InternalAxiosRequestConfig) => {
    config.withCredentials = true
    return config
}

$api.interceptors.request.use(authInterceptor)

export {
    $api
}

export const isApiResponse = (value: unknown): value is ApiResponse<unknown> => {
    if (!value || typeof value !== 'object') {
        return false
    }

    return 'data' in value && 'success' in value && 'error' in value && 'message' in value
}

export const extractApiError = (data: unknown, fallback: string) => {
    if (isApiResponse(data)) {
        if (data.error?.trim()) {
            return data.error
        }
        if (data.message?.trim()) {
            return data.message
        }
    }

    if (typeof data === 'string' && data.trim()) {
        return data
    }

    return fallback
}

export const getAxiosErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        return extractApiError(axiosError.response?.data, axiosError.message || fallback)
    }

    if (error instanceof Error) {
        return error.message
    }

    return fallback
}

export const sendRequest = async <T, P>(
    url: string,
    method: RequestMethod,
    payload?: P,
    isFormData?: boolean
): Promise<AppResponse<T>> => {
    try {
        const response = await $api.request<ApiResponse<T>>({
            url,
            method,
            headers: isFormData
                ? { 'Content-Type': 'multipart/form-data' }
                : apiHeaders,
            ...(payload !== undefined
                ? method === RequestMethods.GET
                    ? { params: payload }
                    : { data: payload }
                : {}),
        })

        const data = response.data

        if (!data?.success) {
            return {
                ok: false,
                status: response.status,
                error: extractApiError(
                    data,
                    response.statusText || `Ошибка запроса (${response.status})`,
                ),
                data,
            }
        }

        return {
            ok: true,
            status: response.status,
            data,
        }
    } catch (error) {
        console.error('Login request failed:', error)
        const status = axios.isAxiosError(error)
            ? error.response?.status ?? 0
            : 0
        const responseData: ApiResponse<T> | null =
            axios.isAxiosError(error) && isApiResponse(error.response?.data)
                ? (error.response?.data as ApiResponse<T>)
                : null
        const formattedError = responseData
            ? extractApiError(responseData, 'Неизвестная ошибка.')
            : 'Неизвестная ошибка.'

        return {
            ok: false,
            status,
            error: formattedError,
            data: responseData,
        }
    }
}
