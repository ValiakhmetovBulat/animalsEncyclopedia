import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import type {FormControlElement} from "../main/types/input.ts";
import CustomSelect, {type DefaultOption} from "../main/CustomSelect.tsx";
import type {SingleValue} from "react-select";
import {addBreed, type Breed, updateBreed} from "../../api/breed.ts";
import {getTypesOptions, type TypeOption} from "../../api/type.ts";

type AddEditBreedModalProps = {
    breed: Breed | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditBreedModal = ({breed, onHide, show, setRefreshKey}: AddEditBreedModalProps) => {
    const [result, setResult] = useState<ResultState<Breed>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [nameError, setNameError] = useState<string>("");
    const [typeError, setTypeError] = useState<string>("");
    const [typesOptions, setTypesOptions] = useState<TypeOption[]>([]);

    const [breedToInsert, setBreedToInsert] = useState<Breed>({
        id: 0,
        name: "",
        type_id: 0,
    });

    const handleInputName = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setBreedToInsert((prev) => ({ ...prev, name: input}))

        if (input.trim() === "") {
            setNameError("Поле «Наименование» обязательно")
            return
        }

        setNameError("")
    }

    const handleSelectType = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setTypeError("Необходимо выбрать тип")
            return
        }

        setTypeError("")

        setBreedToInsert((prev) => ({
            ...prev,
            type_id: selected.value
        }))
    }

    useEffect(() => {
        getTypesOptions().then((resp) => {
            if (resp.ok) {
                if (resp?.data?.data) {
                    setTypesOptions(resp.data.data);
                }
            }
        })
    }, []);

    const typeOptions = useMemo(() => {
        return typesOptions?.map(to => ({
            value: to.id,
            label: to.name
        })) ?? [];
    }, [typesOptions]);

    const selectedType = useMemo(() => {
        return typeOptions.find((t) => t.value === breedToInsert.type_id) ?? null;
    }, [typesOptions, breedToInsert.type_id]);

    useEffect(() => {
        if (breed) {
            setBreedToInsert({
                id: breed.id,
                name: breed.name,
                type_id: breed.type_id,
            })
        } else {
            setBreedToInsert({
                id: 0,
                name: "",
                type_id: 0,
            })
        }
    }, [show, breed]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        if (breedToInsert.id === 0) {
            addBreed(breedToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "related animal not found":
                            msg = "Неверный ID связанного типа"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить породу: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Порода была успешно добавлена",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateBreed(breedToInsert).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "not found":
                            msg = "Обновляемая порода не найдена"
                            break
                        case "related animal not found":
                            msg = "Неверный ID связанного типа"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить породу: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Порода была успешно обновлена",
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
                            breedToInsert.id === 0 ? `Создание породы` : `Редактирование породы ${breedToInsert.id}`
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
                            value={breedToInsert.name}
                            onChange={(e) => handleInputName(e)}
                            onBlur={e=> handleInputName(e)}
                            placeholder="Эта порода обладает..."
                        />
                    </Form.Group>

                    <Form.Group className={"field gap-0 mt-2"}>
                        <Form.Label className={"d-flex align-items-center gap-2"}>
                            Тип животного

                            {
                                typeError && (
                                    <span className="small text-danger fw-normal">
                                                    {
                                                        typeError
                                                    }
                                                </span>
                                )
                            }
                        </Form.Label>

                        <CustomSelect
                            placeholder={"Выберите тип"}
                            isClearable={false}
                            isMulti={false}
                            onChange={(e) =>  handleSelectType(e)}
                            value={selectedType}
                            options={typeOptions}
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

export default AddEditBreedModal;