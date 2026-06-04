import 'react';
import {Container, Tab, Tabs} from "react-bootstrap";
import type {ReactNode} from "react";
import {type Animal, deleteAnimal, getAnimalsPaginated} from "../../api/animal.ts";
import AddEditAnimalModal from "../modals/AddEditAnimalModal.tsx";
import TablePage from "../tables/TablePage.tsx";
import {deleteType, getTypesPaginated, type Type} from "../../api/type.ts";
import AddEditTypeModal from "../modals/AddEditTypeModal.tsx";
import {type Breed, deleteBreed, getBreedsPaginated} from "../../api/breed.ts";
import AddEditBreedModal from "../modals/AddEditBreedModal.tsx";
import AddEditCountryModal from "../modals/AddEditCountryModal.tsx";
import {type Country, deleteCountry, getCountriesPaginated} from "../../api/country.ts";
import {deleteFact, type Fact, getFactsPaginated} from "../../api/fact.ts";
import AddEditColoringModal from "../modals/AddEditColoringModal.tsx";
import {type Coloring, deleteColoring, getColoringsPaginated} from "../../api/coloring.ts";
import AddEditFactModal from "../modals/AddEditFactModal.tsx";

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
                        renderTab("Животные", "animals", <TablePage
                            onDelete={deleteAnimal}
                            dataRequest={getAnimalsPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditAnimalModal
                                    animal={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (a: Animal) => a.id
                                },
                                {
                                    key: "name",
                                    header: "Наименование",
                                    render: (a: Animal) => a.name
                                },
                                {
                                    key: "description",
                                    header: "Описание",
                                    render: (a: Animal) => a.description
                                },
                                {
                                    key: "image_link",
                                    header: "Адрес изображения",
                                    render: (a: Animal) => a.image_link
                                },
                                {
                                    key: "type",
                                    header: "Тип",
                                    render: (a: Animal) => `№${a.type_id} - ${a?.type?.name}`
                                },
                                {
                                    key: "breed",
                                    header: "Порода",
                                    render: (a: Animal) => `№${a.type_id} - ${a?.breed?.name}`
                                },
                                {
                                    key: "country",
                                    header: "Страна",
                                    render: (a: Animal) => `№${a.type_id} - ${a?.country?.name}`
                                },
                            ]}
                        />)
                    }
                    {
                        renderTab("Типы", "types", <TablePage
                            onDelete={deleteType}
                            dataRequest={getTypesPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditTypeModal
                                    givenType={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (t: Type) => t.id
                                },
                                {
                                    key: "name",
                                    header: "Наименование",
                                    render: (t: Type) => t.name
                                },
                            ]}
                        />)
                    }
                    {
                        renderTab("Породы", "breeds", <TablePage
                            onDelete={deleteBreed}
                            dataRequest={getBreedsPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditBreedModal
                                    breed={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (b: Breed) => b.id
                                },
                                {
                                    key: "name",
                                    header: "Наименование",
                                    render: (b: Breed) => b.name
                                },
                                {
                                    key: "type_id",
                                    header: "№ типа",
                                    render: (b: Breed) => b.type_id
                                },
                            ]}
                        />)
                    }
                    {
                        renderTab("Страны", "countries", <TablePage
                            onDelete={deleteCountry}
                            dataRequest={getCountriesPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditCountryModal
                                    country={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (c: Country) => c.id
                                },
                                {
                                    key: "name",
                                    header: "Наименование",
                                    render: (c: Country) => c.name
                                },
                            ]}
                        />)
                    }
                    {
                        renderTab("Факты", "facts", <TablePage
                            onDelete={deleteFact}
                            dataRequest={getFactsPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditFactModal
                                    fact={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (f: Fact) => f.id
                                },
                                {
                                    key: "text",
                                    header: "Текст",
                                    render: (f: Fact) => f.text
                                },
                                {
                                    key: "animal_id",
                                    header: "№ животного",
                                    render: (f: Fact) => f.animal_id
                                },
                            ]}
                        />)
                    }
                    {
                        renderTab("Окрасы", "colorings", <TablePage
                            onDelete={deleteColoring}
                            dataRequest={getColoringsPaginated}
                            renderAddEditModal={({entity, onHide, show, setRefreshKey}) => (
                                <AddEditColoringModal
                                    coloring={entity}
                                    onHide={onHide}
                                    show={show}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}
                            columns={[
                                {
                                    key: "id",
                                    header: "№",
                                    render: (c: Coloring) => c.id
                                },
                                {
                                    key: "name",
                                    header: "Наименование",
                                    render: (c: Coloring) => c.name
                                },
                                {
                                    key: "image_link",
                                    header: "Адрес изображения",
                                    render: (c: Coloring) => c.image_link
                                },
                                {
                                    key: "breed_id",
                                    header: "№ породы",
                                    render: (c: Coloring) => c.breed_id
                                },
                            ]}
                        />)
                    }
                </Tabs>
            </Container>
        </>
    );
};

export default AdminPage;