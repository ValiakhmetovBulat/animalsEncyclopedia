import type {ComponentType} from "react";
import {
    ADMIN_PAGE_ROUTE,
    NOTFOUND_ROUTE,
    MAIN_PAGE_ROUTE, ADMIN_LOGIN_PAGE_ROUTE
} from "./routesConsts.ts";
import NotFoundPage from "../../pages/NotFoundPage.tsx";
import AdminPage from "../../pages/AdminPage.tsx";
import MainPage from "../../pages/MainPage.tsx";
import AdminLoginPage from "../../pages/AdminLoginPage.tsx";

type AppRoute = {
    path: string,
    Component: ComponentType
}

export const publicRoutes: AppRoute[] = [
    {
      path: MAIN_PAGE_ROUTE,
      Component:  MainPage
    },
    {
        path: NOTFOUND_ROUTE,
        Component: NotFoundPage
    },
    {
        path: ADMIN_LOGIN_PAGE_ROUTE,
        Component: AdminLoginPage
    }
]

export const authRoutes: AppRoute[] = []

export const authAdminRoutes: AppRoute[] = [
    {
        path: ADMIN_PAGE_ROUTE,
        Component: AdminPage
    },
]
