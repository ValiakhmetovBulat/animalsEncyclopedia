import 'react';
import {useAuth} from "../../stores/AuthStore.ts";
import {authAdminRoutes, authRoutes, publicRoutes} from "./routes.ts";
import NavBar from "../NavBar.tsx";
import {NOTFOUND_ROUTE} from "./routesConsts.ts";
import {Routes, Route, Navigate} from "react-router-dom"

const AppRouter = () => {
    const {
        isAuth,
        user
    } = useAuth();

    return (
        <div>
            <NavBar/>

            <Routes>
                {
                    publicRoutes.map(({path, Component}) =>
                        <Route
                            key={path}
                            path={path}
                            element={<Component />}
                        />
                    )
                }

                {
                    isAuth && authRoutes.map(({path, Component}) =>
                        <Route
                            key={path}
                            path={path}
                            element={<Component/>}
                        />
                    )
                }

                {
                    isAuth && user?.role.slug === "admin" && authAdminRoutes.map(({path, Component}) =>
                        <Route
                            key={path}
                            path={path}
                            element={<Component/>}
                        />
                    )
                }

                <Route
                    path={"*"}
                    element={<Navigate to={NOTFOUND_ROUTE} replace={true} />}
                />
            </Routes>
        </div>
    );
};

export default AppRouter;