import 'react';
import CustomTable from "./CustomTable.tsx";
import {type Animal, deleteAnimal, getAnimalsPaginated} from "../../api/animal.ts";
import {useState} from "react";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import ActionButtonGroup from "./ActionButtonGroup.tsx";
import CustomAlert from "../main/CustomAlert.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import AddEditAnimalModal from "../modals/AddEditAnimalModal.tsx";

const AnimalsTable = () => {
    const [addEditAnimalModalShow, setAddEditAnimalModalShow] = useState<boolean>(false);
    const [animalToEdit, setAnimalToEdit] = useState<Animal | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Animal>>({status: RESULT_STATUS.IDLE})
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditAnimal = (animal: Animal | null) => {
        setAnimalToEdit(animal);
        setAddEditAnimalModalShow(true);
    }

    const handleDeleteAnimal = (id: number) => {
        deleteAnimal(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Животное не найдено"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить животное: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Животное было успешно удалено",
                data: null,
            })
        })
    }

    return (
        <>
            <CustomAlert
                show={showAlert}
                setShow={setShowAlert}
                result={result}
            />
            <div className={"d-flex justify-content-between"}>
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditAnimal(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <AddEditAnimalModal
                animal={animalToEdit}
                onHide={() => setAddEditAnimalModalShow(false)}
                show={addEditAnimalModalShow}
                setRefreshKey={setRefreshKey}
            />

            <CustomTable
                refreshKey={refreshKey}
                dataRequest={getAnimalsPaginated}
                columns={[
                    {
                        key: "id",
                        header: "№",
                        render: (a) => a.id
                    },
                    {
                        key: "name",
                        header: "Наименование",
                        render: (a) => a.name
                    },
                    {
                        key: "description",
                        header: "Описание",
                        render: (a) => a.description
                    },
                    {
                        key: "image_link",
                        header: "Адрес изображения",
                        render: (a) => a.image_link
                    },
                    {
                        key: "type",
                        header: "Тип",
                        render: (a) => `№${a.type_id} - ${a?.type?.name}`
                    },
                    {
                        key: "breed",
                        header: "Порода",
                        render: (a) => `№${a.type_id} - ${a?.breed?.name}`
                    },
                    {
                        key: "country",
                        header: "Страна",
                        render: (a) => `№${a.type_id} - ${a?.country?.name}`
                    },
                    {
                        key: "action_buttons",
                        header: "Действия",
                        render: (a) =>
                            <ActionButtonGroup
                                onEdit={() => handleAddEditAnimal(a)}
                                onDelete={() => handleDeleteAnimal(a.id)}
                            />
                    }
                ]}
                getRowKey={(b) => b.id}
            />
        </>
    );
};


export default AnimalsTable;