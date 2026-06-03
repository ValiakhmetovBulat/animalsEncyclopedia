import 'react';
import CustomAlert from "../main/CustomAlert.tsx";
import {CloseButton, Form, Modal} from "react-bootstrap";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import {type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import {addAnimal, type Animal, updateAnimal} from "../../api/animal.ts";
import type {FormControlElement} from "../main/types/input.ts";
import CustomSelect, {type DefaultOption} from "../main/CustomSelect.tsx";
import type {SingleValue} from "react-select";
import {type CountryOption, getCountriesOptions} from "../../api/country.ts";
import {getTypesOptions, type TypeOption} from "../../api/type.ts";
import {type BreedOption, getBreedOptionsWithTypeId} from "../../api/breed.ts";

type AddEditAnimalModalProps = {
    animal: Animal | null;
    onHide: () => void;
    show: boolean;
    setRefreshKey: Dispatch<SetStateAction<number>>;
}

const AddEditAnimalModal = ({animal, onHide, show, setRefreshKey}: AddEditAnimalModalProps) => {
    const [result, setResult] = useState<ResultState<Animal>>({ status: RESULT_STATUS.IDLE })
    const [showAlert, setShowAlert] = useState(false);
    const [nameError, setNameError] = useState<string>("");
    const [countryError, setCountryError] = useState<string>("");
    const [typeError, setTypeError] = useState<string>("");
    const [breedError, setBreedError] = useState<string>("");
    const [countriesOptions, setCountriesOptions] = useState<CountryOption[]>([]);
    const [typesOptions, setTypesOptions] = useState<TypeOption[]>([]);
    const [breedsOptions, setBreedsOptions] = useState<BreedOption[]>([]);

    const [animalToInsert, setAnimalToInsert] = useState<Animal>({
        id: 0,
        name: "",
        breed_id: 0,
        country_id: 0,
        type_id: 0,
        image_link: "",
        description: ""
    });

    const handleInputName = (e: ChangeEvent<FormControlElement>) => {
        const input = e.target.value

        setAnimalToInsert((prev) => ({ ...prev, name: input}))

        if (input.trim() === "") {
            setNameError("Поле «Наименование» обязательно")
            return
        }

        setNameError("")
    }

    const handleSelectCountry = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setCountryError("Необходимо выбрать страну")
            return
        }

        setCountryError("")

        setAnimalToInsert((prev) => ({
            ...prev,
            country_id: selected.value
        }))
    }

    const handleSelectType = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setTypeError("Необходимо выбрать тип")
            return
        }

        setTypeError("")

        setAnimalToInsert((prev) => ({
            ...prev,
            type_id: selected.value
        }))
    }

    const handleSelectBreed = (selected: SingleValue<DefaultOption>) => {
        if (!selected) {
            setShowAlert(true);
            setBreedError("Необходимо выбрать породу")
            return
        }

        setBreedError("")

        setAnimalToInsert((prev) => ({
            ...prev,
            breed_id: selected.value
        }))
    }

    useEffect(() => {
        getCountriesOptions().then((resp) => {
            if (resp.ok) {
                if (resp?.data?.data) {
                    setCountriesOptions(resp.data.data);
                }
            }
        })
        getTypesOptions().then((resp) => {
            if (resp.ok) {
                if (resp?.data?.data) {
                    setTypesOptions(resp.data.data);
                }
            }
        })
    }, []);

    useEffect(() => {
        getBreedOptionsWithTypeId(animalToInsert.type_id).then((resp) => {
            if (resp.ok) {
                if (resp?.data?.data) {
                    setBreedsOptions(resp.data.data);
                }
            }
        })
    }, [animalToInsert.type_id]);

    const countryOptions = useMemo(() => {
        return countriesOptions?.map(co => ({
            value: co.id,
            label: co.name
        })) ?? [];
    }, [countriesOptions]);

    const selectedCountry = useMemo(() => {
        return countryOptions.find((o) => o.value === animalToInsert.country_id) ?? null;
    }, [countriesOptions, animalToInsert.country_id]);

    const typeOptions = useMemo(() => {
        return typesOptions?.map(to => ({
            value: to.id,
            label: to.name
        })) ?? [];
    }, [typesOptions]);

    const selectedType = useMemo(() => {
        return typeOptions.find((o) => o.value === animalToInsert.type_id) ?? null;
    }, [typesOptions, animalToInsert.type_id]);

    const breedOptions = useMemo(() => {
        return breedsOptions?.map(bo => ({
            value: bo.id,
            label: bo.name
        })) ?? [];
    }, [breedsOptions]);

    const selectedBreed = useMemo(() => {
        return breedOptions.find((o) => o.value === animalToInsert.breed_id) ?? null;
    }, [breedsOptions, animalToInsert.breed_id]);

    useEffect(() => {
        if (animal) {
            setAnimalToInsert({
                id: animal.id,
                name: animal.name,
                breed_id: animal.breed_id,
                country_id: animal.country_id,
                type_id: animal.type_id,
                image_link: animal.image_link,
                description: animal.description
            })
        } else {
            setAnimalToInsert({
                id: 0,
                name: "",
                breed_id: 0,
                country_id: 0,
                type_id: 0,
                image_link: "",
                description: ""
            })
        }
    }, [show, animal]);

    const handleClose = () => {
        onHide()
    }

    const handleSave = () => {
        if (animalToInsert.id === 0) {
            addAnimal(animalToInsert).then((resp) => {
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
                        message: `Не удалось добавить животное: ${msg}`
                    })

                    return
                }

                setRefreshKey(prev => prev + 1)
                setResult({
                    status: RESULT_STATUS.SUCCESS,
                    message: "Животное было успешно добавлено",
                    data: null,
                })
                handleClose();
            })
        } else {
            updateAnimal(animalToInsert).then((resp) => {
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
                        message: `Не удалось добавить факт: ${msg}`
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
                            animalToInsert.id === 0 ? `Создание животного` : `Редактирование животного ${animalToInsert.id}`
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
                            value={animalToInsert.name}
                            onChange={(e) => handleInputName(e)}
                            onBlur={e=> handleInputName(e)}
                            placeholder="Наименование"
                        />
                    </Form.Group>

                    <Form.Group className={"field gap-0 mt-2"}>
                        <Form.Label className={"d-flex align-items-center gap-2"}>
                            Тип
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

                    <Form.Group className={"field gap-0 mt-2"}>
                        <Form.Label className={"d-flex align-items-center gap-2"}>
                            Страна
                            {
                                countryError && (
                                    <span className="small text-danger fw-normal">
                                                    {
                                                        countryError
                                                    }
                                                </span>
                                )
                            }
                        </Form.Label>

                        <CustomSelect
                            placeholder={"Выберите страну"}
                            isClearable={false}
                            isMulti={false}
                            onChange={(e) =>  handleSelectCountry(e)}
                            value={selectedCountry}
                            options={countryOptions}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="field d-flex align-items-center gap-2 mt-3">
                            Описание
                        </Form.Label>

                        <textarea
                            style={{width: "100%"}}
                            name="description"
                            autoComplete="description"
                            value={animalToInsert.description}
                            onChange={(e) => setAnimalToInsert((prev) => ({ ...prev, description: e.target.value}))}
                            placeholder="Описание животного"
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

export default AddEditAnimalModal;