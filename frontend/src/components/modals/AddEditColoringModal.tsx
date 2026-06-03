import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Image, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {addColoring, type Coloring, type ColoringRequest, updateColoring} from "../../api/coloring.ts";
import type {FormControlElement} from "../main/types/input.ts";
import CustomSelect, {type DefaultOption} from "../main/CustomSelect.tsx";
import type {SingleValue} from "react-select";
import {type BreedOption, getBreedOptions} from "../../api/breed.ts";
import {GetImageUrl} from "../utils/imageHelper.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

type AddEditColoringModalProps = {
    coloring: Coloring | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditColoringModal = ({coloring, onHide, show, setRefreshKey}: AddEditColoringModalProps) => {
    const [result, setResult] = useState<ResultState<Coloring>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [nameError, setNameError] = useState<string>("");
    const [breedError, setBreedError] = useState<string>("");
    const [breedsOptions, setBreedsOptions] = useState<BreedOption[]>([]);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [coloringToInsert, setColoringToInsert] = useState<Coloring>({
        id: 0,
        name: "",
        breed_id: 0,
        image_link: ""
    });

    const handleInputName = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setColoringToInsert((prev) => ({ ...prev, name: input}))

        if (input.trim() === "") {
            setNameError("Поле «Наименование» обязательно")
            return
        }

        setNameError("")
    }

    const handleSelectBreed = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setBreedError("Необходимо выбрать породу")
            return
        }

        setBreedError("")

        setColoringToInsert((prev) => ({
            ...prev,
            breed_id: selected.value
        }))
    }

    useEffect(() => {
        if (show) {
            getBreedOptions().then((resp) => {
                if (resp.ok) {
                    if (resp?.data?.data) {
                        setBreedsOptions(resp.data.data);
                    }
                }
            })
        }
    }, [show]);

    const breedOptions = useMemo(() => {
        return breedsOptions?.map(bo => ({
            value: bo.id,
            label: bo.name
        })) ?? [];
    }, [breedsOptions]);

    const selectedBreed = useMemo(() => {
        return breedOptions.find((o) => o.value === coloringToInsert.breed_id) ?? null;
    }, [breedOptions, coloringToInsert.breed_id]);

    useEffect(() => {
        if (coloring) {
            setColoringToInsert({
                id: coloring.id,
                name: coloring.name,
                breed_id: coloring.breed_id,
                image_link: coloring.image_link,
            })
        } else {
            setColoringToInsert({
                id: 0,
                name: "",
                breed_id: 0,
                image_link: "",
            })
        }

        setImagePreview("");
    }, [show, coloring]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        const coloringRequest: ColoringRequest = {
            id: coloringToInsert.id,
            breed_id: coloringToInsert.breed_id,
            image_link: coloringToInsert.image_link,
            name: coloringToInsert.name,
            new_image: imagePreview,
        }

        if (coloringToInsert.id === 0) {
            addColoring(coloringRequest).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "related coloring not found":
                            msg = "Неверный ID связанной породы"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось добавить окрас: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Окрас был успешно добавлен",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateColoring(coloringRequest).then((resp) => {
                setShowAlert(true);
                if (!resp.ok) {
                    let msg

                    switch (resp?.data?.message) {
                        case "invalid JSON structure":
                            msg = "Неверная структура запроса"
                            break
                        case "not found":
                            msg = "Обновляемый окрас не найден"
                            break
                        case "related coloring not found":
                            msg = "Неверный ID связанной породы"
                            break
                        default:
                            msg = "Неизвестная ошибка"
                    }
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: `Не удалось редактировать окрас: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Животное было успешно обновлено",
                    data: null,
                })
                handleClose();
            })
        }
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64 = reader.result as string;

            setImagePreview(base64);
        };

        reader.readAsDataURL(file);
    }

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        }
    }, [imagePreview]);

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
                            coloringToInsert.id === 0 ? `Создание окраса` : `Редактирование окраса ${coloringToInsert.id}`
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
                            name="name"
                            autoComplete="name"
                            value={coloringToInsert.name}
                            onChange={(e) => handleInputName(e)}
                            onBlur={e=> handleInputName(e)}
                            placeholder="Наименование"
                        />
                    </Form.Group>

                    <Form.Group className={"field gap-0 mt-2"}>
                        <Form.Label className={"d-flex align-items-center gap-2"}>
                            Порода
                            {
                                breedError && (
                                    <span className="small text-danger fw-normal">
                                                    {
                                                        breedError
                                                    }
                                                </span>
                                )
                            }
                        </Form.Label>

                        <CustomSelect
                            placeholder={"Выберите породу"}
                            isClearable={false}
                            isMulti={false}
                            onChange={(e) =>  handleSelectBreed(e)}
                            value={selectedBreed}
                            options={breedOptions}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="field d-flex align-items-center gap-2 mt-3">
                            Изображение
                        </Form.Label>

                        {
                            imagePreview || coloringToInsert.image_link ? (
                                <>
                                    <Image
                                        src={
                                            imagePreview
                                                ? imagePreview
                                                : GetImageUrl(coloringToInsert.image_link)
                                        }
                                        alt={"coloring-image"}
                                    />

                                    <CloseButton
                                        onClick={() => {
                                            setImagePreview("");
                                            setColoringToInsert(prev => ({
                                                ...prev,
                                                image_link: ""
                                            }));
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />

                                    <button
                                        type="button"
                                        className={"button-custom"}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </button>
                                </>
                            )
                        }
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

export default AddEditColoringModal;