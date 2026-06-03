import 'react';
import CustomTable from "./CustomTable.tsx";
import {type Breed, deleteBreed, getBreedsPaginated} from "../../api/breed.ts";
import {useState} from "react";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import CustomAlert from "../main/CustomAlert.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import AddEditBreedModal from "../modals/AddEditBreedModal.tsx";
import ActionButtonGroup from "./ActionButtonGroup.tsx";

const BreedsTable = () => {
    const [addEditBreedModalShow, setAddEditBreedModalShow] = useState<boolean>(false);
    const [breedToEdit, setBreedToEdit] = useState<Breed | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Breed>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditBreed = (breed: Breed | null) => {
        setBreedToEdit(breed);
        setAddEditBreedModalShow(true);
    }

    const handleDeleteBreed = (id: number) => {
        deleteBreed(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Порода не найдена"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить породу: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Порода был успешно удалена",
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
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditBreed(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <AddEditBreedModal
                breed={breedToEdit}
                onHide={() => setAddEditBreedModalShow(false)}
                show={addEditBreedModalShow}
                setRefreshKey={setRefreshKey}
            />
            <CustomTable
            refreshKey={refreshKey}
            dataRequest={getBreedsPaginated}
            columns={[
                {
                    key: "id",
                    header: "№",
                    render: (b) => b.id
                },
                {
                    key: "name",
                    header: "Наименование",
                    render: (b) => b.name
                },
                {
                    key: "type_id",
                    header: "№ типа",
                    render: (b) => b.type_id
                },
                {
                    key: "action_buttons",
                    header: "Действия",
                    render: (b) =>
                        <ActionButtonGroup
                            onEdit={() => handleAddEditBreed(b)}
                            onDelete={() => handleDeleteBreed(b.id)}
                        />
                }
            ]}
            getRowKey={(b) => b.id}
        />
        </>
    );
};

export default BreedsTable;