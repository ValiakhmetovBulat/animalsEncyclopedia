import 'react';
import {Container, Nav, Navbar} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../stores/AuthStore.ts";
import {faCat, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ADMIN_PAGE_ROUTE, MAIN_PAGE_ROUTE} from "./routing/routesConsts.ts";

const NavBar = () => {
    const navigate = useNavigate();

    const {
        isAuth,
        user,
        logoutUser
    } = useAuth();

    const handleLogout = () => {
        logoutUser().then(() => {
            navigate(MAIN_PAGE_ROUTE);
        })
    }

    return (
        <Navbar expand={"lg"}>
            <Container>
                <Navbar.Brand onClick={() => navigate(MAIN_PAGE_ROUTE)} className={"d-flex flex-wrap ms-0 mt-3 gap-3"}>
                    <FontAwesomeIcon icon={faCat} size="lg" />
                    <h3 className={"fw-bold"}>Энциклопедия домашних животных</h3>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls={"main-navbar"}/>
                <Navbar.Collapse id={"main-navbar"}>
                    <Nav className={"ms-auto"}>
                        {
                            isAuth && user?.role.slug === "admin" && (
                                <>
                                    <Nav.Link href={ADMIN_PAGE_ROUTE}>
                                        Панель администратора
                                    </Nav.Link>
                                    <Nav.Link>
                                        <FontAwesomeIcon icon={faRightFromBracket} className={"logout-button"}
                                                         onClick={handleLogout}/>
                                    </Nav.Link>
                                </>
                            )
                        }

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;