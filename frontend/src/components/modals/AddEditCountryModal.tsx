import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useState} from "react";
import {addCountry, type Country, updateCountry} from "../../api/country.ts";
import type {FormControlElement} from "../main/types/input.ts";

type AddEditCountryModalProps = {
    country: Country | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditCountryModal = ({country, onHide, show, setRefreshKey}: AddEditCountryModalProps) => {
    const [result, setResult] = useState<ResultState<Country>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [nameError, setNameError] = useState<string>("");

    const [countryToInsert, setCountryToInsert] = useState<Country>({
        id: 0,
        name: ""
    });

    const handleInputName = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setCountryToInsert((prev) => ({ ...prev, name: input}))

        if (input.trim() === "") {
            setNameError("Поле «Наименование» обязательно")
            return
        }

        setNameError("")
    }

    useEffect(() => {
        if (country) {
            setCountryToInsert({
                id: country.id,
                name: country.name,
            })
        } else {
            setCountryToInsert({
                id: 0,
                name: "",
            })
        }
    }, [show, country]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        if (countryToInsert.id === 0) {
            addCountry(countryToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить страну: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Страна была успешно добавлена",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateCountry(countryToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "not found":
                            msg = "Обновляемая страна не найдена"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось редактировать страну: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Страна была успешно обновлена",
                    data: null,
                })
                handleClose();
            })
        }
    }

    return (
        <>
            <CustomAlert
                show={showAlert}
                setShow={setShowAlert}
                result={result}
            />
            <Modal
                size={"xl"}
                centered={true}
                aria-hidden={false}
                backdrop={"static"}
                enforceFocus={false}
                onHide={onHide}
                show={show}
            >
                <Modal.Header>
                    <h3>
                        {
                            countryToInsert.id === 0 ? `Добавление страны` : `Редактирование страны ${countryToInsert.id}`
                        }
                    </h3>

                    <CloseButton
                        onClick={handleClose}
                    />
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="field d-flex align-items-center gap-2">
                            Наименование
                            {
                                nameError && (
                                    <span className="small text-danger fw-normal">
                                                {
                                                    nameError
                                                }
                                            </span>
                                )
                            }
                        </Form.Label>

                        <Form.Control
                            isInvalid={nameError ? nameError.length > 0 : false}
                            type="text"
                            name="text"
                            autoComplete="text"
                            value={countryToInsert.name}
                            onChange={(e) => handleInputName(e)}
                            onBlur={e=> handleInputName(e)}
                            placeholder="Новая страна"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className={"button-custom-cancel d-flex align-items-center"}
                        onClick={handleClose}
                    >
                        Отмена
                    </button>

                    <button
                        className={"button-custom d-flex align-items-center"}
                        onClick={handleSave}
                    >
                        Сохранить
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddEditCountryModal;