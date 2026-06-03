import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useState} from "react";
import type {FormControlElement} from "../main/types/input.ts";
import {addType, type Type, updateType} from "../../api/type.ts";

type AddEditTypeModalProps = {
    givenType: Type | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditTypeModal = ({givenType, onHide, show, setRefreshKey}: AddEditTypeModalProps) => {
    const [result, setResult] = useState<ResultState<Type>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [nameError, setNameError] = useState<string>("");

    const [typeToInsert, setTypeToInsert] = useState<Type>({
        id: 0,
        name: ""
    });

    const handleInputName = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setTypeToInsert((prev) => ({ ...prev, name: input}))

        if (input.trim() === "") {
            setNameError("Поле «Наименование» обязательно")
            return
        }

        setNameError("")
    }

    useEffect(() => {
        if (givenType) {
            setTypeToInsert({
                id: givenType.id,
                name: givenType.name,
            })
        } else {
            setTypeToInsert({
                id: 0,
                name: "",
            })
        }
    }, [show, givenType]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        if (typeToInsert.id === 0) {
            addType(typeToInsert).then((resp) => {
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
                        message: `Не удалось добавить тип: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Тип был успешно добавлен",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateType(typeToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "not found":
                            msg = "Обновляемый тип не найден"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить тип: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Тип был успешно обновлен",
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
                            typeToInsert.id === 0 ? `Добавление типа` : `Редактирование типа ${typeToInsert.id}`
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
                            value={typeToInsert.name}
                            onChange={(e) => handleInputName(e)}
                            onBlur={e=> handleInputName(e)}
                            placeholder="Новый тип"
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

export default AddEditTypeModal;