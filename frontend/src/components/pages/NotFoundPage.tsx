import 'react';
import {Container} from "react-bootstrap";
import {MAIN_PAGE_ROUTE} from "../main/routing/routesConsts.ts";

const NotFoundPage = () => {
    return (
        <Container className={"mt-3"}>
            <h2>404 - Страница не найдена</h2>

            <a href={MAIN_PAGE_ROUTE}>На главную</a>
        </Container>
    );
};

export default NotFoundPage;