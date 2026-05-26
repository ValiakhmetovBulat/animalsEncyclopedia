import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import {addFact, type Fact, updateFact} from "../../api/fact.ts";
import type {FormControlElement} from "../main/types/input.ts";
import CustomSelect, {type DefaultOption} from "../main/CustomSelect.tsx";
import type {SingleValue} from "react-select";
import {type AnimalOption, getAnimalsOptions} from "../../api/animal.ts";

type AddEditFactModalProps = {
    fact: Fact | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditFactModal = ({fact, onHide, show, setRefreshKey}: AddEditFactModalProps) => {
    const [result, setResult] = useState<ResultState<Fact>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [textError, setTextError] = useState<string>("");
    const [animalError, setAnimalError] = useState<string>("");
    const [animalsOptions, setAnimalsOptions] = useState<AnimalOption[]>([]);

    const [factToInsert, setFactToInsert] = useState<Fact>({
        id: 0,
        text: "",
        animal_id: 0,
    });

    const handleInputText = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setFactToInsert((prev) => ({ ...prev, text: input}))

        if (input.trim() === "") {
            setTextError("Поле «Текст» обязательно")
            return
        }

        setTextError("")
    }

    const handleSelectAnimal = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setAnimalError("Необходимо выбрать животное")
            return
        }

        setAnimalError("")

        setFactToInsert((prev) => ({
            ...prev,
            animal_id: selected.value
        }))
    }

    useEffect(() => {
        if (show) {
            getAnimalsOptions().then((resp) => {
                if (resp.ok) {
                    if (resp?.data?.data) {
                        setAnimalsOptions(resp.data.data);
                    }
                }
            })
        }
    }, [show]);

    const animalOptions = useMemo(() => {
        return animalsOptions?.map(ao => ({
            value: ao.id,
            label: ao.name
        })) ?? [];
    }, [animalsOptions]);

    const selectedAnimal = useMemo(() => {
        return animalOptions.find((o) => o.value === factToInsert.animal_id) ?? null;
    }, [animalOptions, factToInsert.animal_id]);

    useEffect(() => {
        if (fact) {
            setFactToInsert({
                id: fact.id,
                text: fact.text,
                animal_id: fact.animal_id,
            })
        } else {
            setFactToInsert({
                id: 0,
                text: "",
                animal_id: 0,
            })
        }
    }, [show, fact]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        if (factToInsert.id === 0) {
            addFact(factToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "related animal not found":
                            msg = "Неверный ID связанного животного"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить факт: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Факт был успешно добавлен",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateFact(factToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "not found":
                            msg = "Обновляемый факт не найден"
                            break
                        case "related animal not found":
                            msg = "Неверный ID связанного животного"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось редактировать факт: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Факт был успешно обновлен",
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
                            factToInsert.id === 0 ? `Создание факта` : `Редактирование факта ${factToInsert.id}`
                        }
                    </h3>

                    <CloseButton
                        onClick={handleClose}
                    />
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="field d-flex align-items-center gap-2">
                            Текст
                            {
                                textError && (
                                    <span className="small text-danger fw-normal">
                                                {
                                                    textError
                                                }
                                            </span>
                                )
                            }
                        </Form.Label>

                        <textarea
                            style={{width: "100%"}}
                            name="text"
                            autoComplete="text"
                            value={factToInsert.text}
                            onChange={(e) => handleInputText(e)}
                            onBlur={e=> handleInputText(e)}
                            placeholder="Эта порода обладает..."
                        />
                    </Form.Group>

                    <Form.Group className={"field gap-0 mt-2"}>
                        <Form.Label className={"d-flex align-items-center gap-2"}>
                            Животное

                            {
                                animalError && (
                                    <span className="small text-danger fw-normal">
                                                    {
                                                        animalError
                                                    }
                                                </span>
                                )
                            }
                        </Form.Label>

                        <CustomSelect
                            placeholder={"Выберите животное"}
                            isClearable={false}
                            isMulti={false}
                            onChange={(e) =>  handleSelectAnimal(e)}
                            value={selectedAnimal}
                            options={animalOptions}
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

export default AddEditFactModal;