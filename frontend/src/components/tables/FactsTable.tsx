import 'react';
import CustomTable from "./CustomTable.tsx";
import {deleteFact, type Fact, getFactsPaginated} from "../../api/fact.ts";
import AddEditFactModal from "../modals/AddEditFactModal.tsx";
import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import ActionButtonGroup from "./ActionButtonGroup.tsx";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import CustomAlert from "../main/CustomAlert.tsx";

const FactsTable = () => {
    const [addEditFactModalShow, setAddEditFactModalShow] = useState<boolean>(false);
    const [factToEdit, setFactToEdit] = useState<Fact | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Fact>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditFact = (fact: Fact | null) => {
        setFactToEdit(fact);
        setAddEditFactModalShow(true);
    }

    const handleDeleteFact = (id: number) => {
        deleteFact(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Факт не найден"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить факт: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Факт был успешно удален",
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
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditFact(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <AddEditFactModal
                fact={factToEdit}
                onHide={() => setAddEditFactModalShow(false)}
                show={addEditFactModalShow}
                setRefreshKey={setRefreshKey}
            />
            <CustomTable
                refreshKey={refreshKey}
                dataRequest={getFactsPaginated}
                columns={[
                    {
                        key: "id",
                        header: "№",
                        render: (f) => f.id
                    },
                    {
                        key: "text",
                        header: "Текст",
                        render: (f) => f.text
                    },
                    {
                        key: "animal_id",
                        header: "№ животного",
                        render: (f) => f.animal_id
                    },
                    {
                        key: "action_buttons",
                        header: "Действия",
                        render: (f) =>
                            <ActionButtonGroup
                                onEdit={() => handleAddEditFact(f)}
                                onDelete={() => handleDeleteFact(f.id)}
                            />
                    }
                ]}
                getRowKey={(f) => f.id}

            />
        </>
    );
};

export default FactsTable;