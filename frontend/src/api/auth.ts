import {type AppResponse, sendRequest} from './client'
import {RequestMethods} from "./request_methods.ts";
import type {Role} from "./role.ts";

export type LoginRequest = {
    username: string
    password: string
}

export type LoginData = {
    username: string
    password_change_required: boolean
    api_key_expires_at: string;
    first_name: string;
    last_name: string;
    patronymic: string;
    email: string;
    role: Role;
}

export const check = async (): Promise<AppResponse<LoginData>> => {
    return await sendRequest<LoginData, null>('/auth/me', RequestMethods.GET)
}

export const login = async (
    payload: LoginRequest,
): Promise<AppResponse<LoginData>> => {
    return await sendRequest<LoginData, LoginRequest>('/login', RequestMethods.POST, payload)
}

export const logout = async (
): Promise<AppResponse<null>> => {
    return await sendRequest('/auth/logout', RequestMethods.POST, null)
}