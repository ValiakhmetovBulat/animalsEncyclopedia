import 'react';
import CustomTable from "./CustomTable.tsx";
import {deleteType, getTypesPaginated, type Type} from "../../api/type.ts";
import {useState} from "react";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import CustomAlert from "../main/CustomAlert.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import ActionButtonGroup from "./ActionButtonGroup.tsx";
import AddEditTypeModal from "../modals/AddEditTypeModal.tsx";

const TypesTable = () => {
    const [addEditTypeModalShow, setAddEditTypeModalShow] = useState<boolean>(false);
    const [typeToEdit, setTypeToEdit] = useState<Type | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Type>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditType = (t: Type | null) => {
        setTypeToEdit(t);
        setAddEditTypeModalShow(true);
    }

    const handleDeleteType = (id: number) => {
        deleteType(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Тип не найден"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить тип: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Тип был успешно удален",
                data: null,
            })
        })
    }

    return (
        <>
            <AddEditTypeModal
                givenType={typeToEdit}
                onHide={() => setAddEditTypeModalShow(false)}
                show={addEditTypeModalShow}
                setRefreshKey={setRefreshKey}
            />

            <CustomAlert
                show={showAlert}
                setShow={setShowAlert}
                result={result}
            />

            <div className={"d-flex justify-content-between"}>
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditType(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <CustomTable
                refreshKey={refreshKey}
                dataRequest={getTypesPaginated}
                columns={[
                    {
                        key: "id",
                        header: "№",
                        render: (t) => t.id
                    },
                    {
                        key: "name",
                        header: "Наименование",
                        render: (t) => t.name
                    },
                    {
                        key: "action_buttons",
                        header: "Действия",
                        render: (t) =>
                            <ActionButtonGroup
                                onEdit={() => handleAddEditType(t)}
                                onDelete={() => handleDeleteType(t.id)}
                            />
                    }
                ]}
                getRowKey={(f) => f.id}
            />
        </>
    );
};

export default TypesTable;