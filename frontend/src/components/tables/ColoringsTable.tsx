import 'react';
import CustomTable from "./CustomTable.tsx";
import {getColoringsPaginated} from "../../api/coloring.ts";
import {useState} from "react";
import {type Coloring, deleteColoring} from "../../api/coloring.ts";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import CustomAlert from "../main/CustomAlert.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import AddEditColoringModal from "../modals/AddEditColoringModal.tsx";
import ActionButtonGroup from "./ActionButtonGroup.tsx";

const ColoringsTable = () => {
    const [addEditColoringModalShow, setAddEditColoringModalShow] = useState<boolean>(false);
    const [coloringToEdit, setColoringToEdit] = useState<Coloring | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Coloring>>({status: RESULT_STATUS.IDLE})
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditColoring = (coloring: Coloring | null) => {
        setColoringToEdit(coloring);
        setAddEditColoringModalShow(true);
    }

    const handleDeleteColoring = (id: number) => {
        deleteColoring(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Окрас не найден"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить окрас: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Окрас был успешно удален",
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
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditColoring(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <AddEditColoringModal
                coloring={coloringToEdit}
                onHide={() => setAddEditColoringModalShow(false)}
                show={addEditColoringModalShow}
                setRefreshKey={setRefreshKey}
            />

            <CustomTable
                refreshKey={refreshKey}
                dataRequest={getColoringsPaginated}
                columns={[
                    {
                        key: "id",
                        header: "№",
                        render: (c) => c.id
                    },
                    {
                        key: "name",
                        header: "Наименование",
                        render: (c) => c.name
                    },
                    {
                        key: "image_link",
                        header: "Адрес изображения",
                        render: (c) => c.image_link
                    },
                    {
                        key: "breed_id",
                        header: "№ породы",
                        render: (c) => c.breed_id
                    },
                    {
                        key: "action_buttons",
                        header: "Действия",
                        render: (c) =>
                            <ActionButtonGroup
                                onEdit={() => handleAddEditColoring(c)}
                                onDelete={() => handleDeleteColoring(c.id)}
                            />
                    }
                ]}
                getRowKey={(c) => c.id}
            />
        </>
    );
};

export default ColoringsTable;