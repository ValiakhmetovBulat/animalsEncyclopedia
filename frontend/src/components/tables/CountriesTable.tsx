import 'react';
import CustomTable from "./CustomTable.tsx";
import {type Country, deleteCountry, getCountriesPaginated} from "../../api/country.ts";
import {useState} from "react";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import CustomAlert from "../main/CustomAlert.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotate} from "@fortawesome/free-solid-svg-icons";
import ActionButtonGroup from "./ActionButtonGroup.tsx";
import AddEditCountryModal from "../modals/AddEditCountryModal.tsx";

const CountriesTable = () => {
    const [addEditCountryModalShow, setAddEditCountryModalShow] = useState<boolean>(false);
    const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [result, setResult] = useState<ResultState<Country>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const handleAddEditCountry = (country: Country | null) => {
        setCountryToEdit(country);
        setAddEditCountryModalShow(true);
    }

    const handleDeleteCountry = (id: number) => {
        deleteCountry(id).then((resp) => {
            setShowAlert(true);
            if (!resp.ok) {
                let msg

                switch (resp?.data?.message) {
                    case "param id is invalid":
                        msg = "Неверная структура запроса"
                        break
                    case "not found":
                        msg = "Страна не найдена"
                        break
                    default:
                        msg = "Неизвестная ошибка"
                }
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: `Не удалось удалить страну: ${msg}`
                })

                return
            }

            setRefreshKey(prev => prev + 1)
            setResult({
                status: RESULT_STATUS.SUCCESS,
                message: "Страна была успешно удалена",
                data: null,
            })
        })
    }

    return (
        <>
            <AddEditCountryModal
                country={countryToEdit}
                onHide={() => setAddEditCountryModalShow(false)}
                show={addEditCountryModalShow}
                setRefreshKey={setRefreshKey}
            />

            <CustomAlert
                show={showAlert}
                setShow={setShowAlert}
                result={result}
            />

            <div className={"d-flex justify-content-between"}>
                <button className={"button-custom d-flex align-items-center"} onClick={() => handleAddEditCountry(null)}>
                    Добавить <FontAwesomeIcon icon={faPlus}/>
                </button>

                <button className={"button-custom-edit d-flex align-items-center"} onClick={() => setRefreshKey(prev => prev + 1)}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
            </div>

            <CustomTable
                refreshKey={refreshKey}
                dataRequest={getCountriesPaginated}
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
                        key: "action_buttons",
                        header: "Действия",
                        render: (c) =>
                            <ActionButtonGroup
                                onEdit={() => handleAddEditCountry(c)}
                                onDelete={() => handleDeleteCountry(c.id)}
                            />
                    }
                ]}
                getRowKey={(c) => c.id}
            />
        </>
    );
};

export default CountriesTable;