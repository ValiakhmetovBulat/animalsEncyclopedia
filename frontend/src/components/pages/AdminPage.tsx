import 'react';
import {Container, Tab, Tabs} from "react-bootstrap";
import type {ReactNode} from "react";
import CountriesTable from "../tables/CountriesTable.tsx";
import BreedsTable from "../tables/BreedsTable.tsx";
import TypesTable from "../tables/TypesTable.tsx";
import AnimalsTable from "../tables/AnimalsTable.tsx";
import FactsTable from "../tables/FactsTable.tsx";
import ColoringsTable from "../tables/ColoringsTable.tsx";

const renderTab = (title: string, key: string, content: ReactNode) => {
    return <Tab title={title} key={key} eventKey={key} className={"mt-4"}>
        <Container className={"mt-3"}>
            {
                content
            }
        </Container>
    </Tab>
}

const AdminPage = () => {
    return (
        <>
            <Container className={"mt-4"}>
                <h2>
                    Панель администратора
                </h2>

                <Tabs defaultActiveKey={"animals"} className={"custom-tabs"}>
                    {
                        renderTab("Животные", "animals", <AnimalsTable/>)
                    }
                    {
                        renderTab("Типы", "types", <TypesTable/>)
                    }
                    {
                        renderTab("Породы", "breeds", <BreedsTable/>)
                    }
                    {
                        renderTab("Страны", "countries", <CountriesTable/>)
                    }
                    {
                        renderTab("Факты", "facts", <FactsTable/>)
                    }
                    {
                        renderTab("Окрасы", "colorings", <ColoringsTable/>)
                    }
                </Tabs>
            </Container>
        </>
    );
};

export default AdminPage;