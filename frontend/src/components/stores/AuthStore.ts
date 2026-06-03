import {create} from "zustand"
import {check, login, type LoginData, type LoginRequest, logout} from "../../api/auth.ts";

type AuthState = {
    user: LoginData | null
    isAuth: boolean
    error: string
    message: string
    loginUser: (payload: LoginRequest) => ReturnType<typeof login>
    logoutUser: () => ReturnType<typeof logout>
    checkUser: () => ReturnType<typeof check>
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuth: false,
    error: "",
    message: "",

    loginUser: async(payload: LoginRequest) => {
        const resp = await login(payload);

        if (resp.ok) {
            set({
                user: resp.data?.data ?? null,
                isAuth: true,
                message: resp.data?.message ?? "",
                error: "",
            })
        } else {
            set({
                user: null,
                isAuth: false,
                error: resp.error ?? "",
                message: resp.data?.message ?? ""
            })
        }

        return resp
    },

    logoutUser: async() => {
        const resp = await logout();

        set({
            user: resp.data?.data ?? null,
            isAuth: false,
            message: resp.data?.message ?? "",
            error: resp.data?.error ?? "",
        })

        return resp
    },

    checkUser: async() => {
        const resp = await check();

        if (resp.ok) {
            set({
                user: resp.data?.data ?? null,
                isAuth: true,
                message: resp.data?.message ?? "",
                error: "",
            })
        } else {
            set({
                user: null,
                isAuth: false,
                error: resp.error ?? "",
                message: resp.data?.message ?? ""
            })
        }

        return resp
    }
}))
