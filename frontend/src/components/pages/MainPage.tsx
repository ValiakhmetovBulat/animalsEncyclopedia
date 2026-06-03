import 'react';
import {Container, FormControl, FormLabel, FormSelect, Pagination} from "react-bootstrap";
import {type ReactNode, useEffect, useState} from "react";
import {type Animal, getAnimalsPaginated} from "../../api/animal.ts";
import AnimalCard from "../cards/AnimalCard.tsx";
import {useBreeds} from "../stores/BreedsStore.ts";
import {useCountries} from "../stores/CountriesStore.ts";
import {useTypes} from "../stores/TypesStore.ts";
import LoadingSpinner from "../main/LoadingSpinner.tsx";
import {RESULT_STATUS, type ResultState} from "../../api/result.ts";
import type {Breed} from "../../api/breed.ts";
import AnimalDetailsModal from "../modals/AnimalDetailsModal.tsx";

const MainPage = () => {
    const [animals, setAnimals] = useState<Animal[] | null>();
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(8);
    const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
    const [selectedBreedId, setSelectedBreedId] = useState<number>(0);
    const [formattedBreeds, setFormattedBreeds] = useState<Breed[]>([]);
    const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [result, setResult] = useState<ResultState<null>>({ status: RESULT_STATUS.IDLE })
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [detailedAnimal, setDetailedAnimal] = useState<Animal>({
        breed: undefined,
        breed_id: 0,
        country: undefined,
        country_id: 0,
        description: "",
        id: 0,
        image_link: "",
        type: undefined,
        type_id: 0,
        name: "Неизвестно"});

    const {
        breeds,
        getBreeds
    } = useBreeds()

    const {
        getCountries,
        countries
    } = useCountries()

    const {
        types,
        getTypes
    } = useTypes()

    useEffect(() => {
        if (!breeds) {
            getBreeds().then((resp) => {
                if (!resp.ok) {
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: "Не удалось получить список пород"
                    })
                    return
                }
            })
        }
    }, [breeds, getBreeds]);

    useEffect(() => {
        if (breeds) {
            if (selectedTypeId) {
                setFormattedBreeds(breeds.filter((b) => b.type_id === selectedTypeId))
            } else {
                setFormattedBreeds(breeds);
            }
        }
    }, [breeds, selectedTypeId]);

    useEffect(() => {
        if (!countries) {
            getCountries().then((resp) => {
                if (!resp.ok) {
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: "Не удалось получить список стран"
                    })
                    return
                }
            })
        }
    }, [countries, getCountries]);

    useEffect(() => {
        if (!types) {
            getTypes().then((resp) => {
                if (!resp.ok) {
                    setResult({
                        status: RESULT_STATUS.ERROR,
                        message: "Не удалось получить список типов животных"
                    })
                    return
                }
            })
        }
    }, [types, getTypes]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setLoading(true);

        getAnimalsPaginated(currentPage, limit, selectedTypeId, selectedBreedId, selectedCountryId, debouncedSearch).then((resp) => {
            if (!resp.ok) {
                setResult({
                    status: RESULT_STATUS.ERROR,
                    message: "Не удалось получить список животных"
                })
                return;
            }

            if (resp.data?.data) {
                setTotal(resp.data.data.total);
                setAnimals(resp.data.data.data);
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [currentPage, limit, selectedTypeId, selectedBreedId, selectedCountryId, debouncedSearch]);

    useEffect(() => {

    }, [selectedTypeId]);

    const handleShowDetailsModal = (animal: Animal) => {
        setShowDetailsModal(true);
        setDetailedAnimal(animal);
    }

    const getPaginationItems = () => {
        const totalPages = Math.ceil(total / limit);
        const paginationItems: ReactNode[] = [];
        let isPrevEllipsis = false;

        const isPaginationItem = (index: number, totalPages: number) => {
            return (index >= currentPage - 1 && index <= currentPage + 1) || index == totalPages || index == 1;
        };

        for (let i = 1; i <= totalPages; i++) {
            if (isPaginationItem(i, totalPages)) {
                paginationItems.push(
                    <Pagination.Item key={i} onClick={() => setCurrentPage(i)} active={currentPage === i}>
                        {i}
                    </Pagination.Item>
                );
                isPrevEllipsis = false;
            } else {
                if (!isPrevEllipsis) {
                    paginationItems.push(
                        <Pagination.Ellipsis key={`ellipsis-${i}`} disabled={true}/>
                    );
                }
                isPrevEllipsis = true;
            }
        }
        return [
            <Pagination.First key={-3} onClick={() => setCurrentPage(1)}/>,
            <Pagination.Prev key={-2} onClick={() => setCurrentPage((prev) => prev - 1 ? prev - 1 : prev)}/>,
            paginationItems,
            <Pagination.Next key={-1} onClick={() => setCurrentPage((prev) => prev + 1 <= totalPages ? prev + 1 : prev)}/>,
            <Pagination.Last key={-4} onClick={() => setCurrentPage(totalPages)}/>
        ];
    }

    return (
        <>
            <AnimalDetailsModal
                onHide={() => setShowDetailsModal(false)}
                show={showDetailsModal}
                animal={detailedAnimal}
            />
            <Container className={"mt-4"}>
            <h2>
                Главная страница
            </h2>

            <div className={"d-flex justify-content-between gap-3"}>
                <div className={"d-flex gap-3 w-100 flex-wrap"}>
                    {
                        types ? (
                            <div className={"flex-grow-0"}>
                                <FormLabel column={true} htmlFor={"animalType"}>
                                    Тип
                                </FormLabel>
                                <FormSelect
                                    id={"animalType"}
                                    aria-label={"Тип"}
                                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                                    value={selectedTypeId}
                                >
                                    <option value={0}>Все</option>
                                    {
                                        types.map(type => (
                                            <option value={type.id} key={type.id}>{type.name}</option>
                                        ))
                                    }
                                    {
                                        types.length === 0 && (
                                            <option>Нет данных</option>
                                        )
                                    }
                                </FormSelect>
                            </div>
                        ) : (
                            <LoadingSpinner/>
                        )
                    }

                    {
                        breeds ? (
                            <div className={"flex-grow-0"}>
                                <FormLabel column={true} htmlFor={"animalBreed"}>
                                    Порода
                                </FormLabel>
                                <FormSelect
                                    id={"animalBreed"}
                                    aria-label={"Порода"}
                                    onChange={(e) => setSelectedBreedId(Number(e.target.value))}
                                    value={selectedBreedId}
                                >
                                    <option value={0}>Все</option>
                                    {
                                        formattedBreeds.map(breed => (
                                            <option value={breed.id} key={breed.id}>{breed.name}</option>
                                        ))
                                    }
                                    {
                                        formattedBreeds.length === 0 && (
                                            <option>Нет данных</option>
                                        )
                                    }
                                </FormSelect>
                            </div>
                        ) : (
                            <LoadingSpinner/>
                        )
                    }

                    {
                        countries ? (
                            <div className={"flex-grow-0"}>
                                <FormLabel column={true} htmlFor={"animalCountries"}>
                                    Страна
                                </FormLabel>
                                <FormSelect
                                    id={"animalCountries"}
                                    aria-label={"Страна"}
                                    onChange={(e) => setSelectedCountryId(Number(e.target.value))}
                                    value={selectedCountryId}
                                >
                                    <option value={0}>Все</option>
                                    {
                                        countries.map(country => (
                                            <option value={country.id} key={country.id}>{country.name}</option>
                                        ))
                                    }
                                    {
                                        countries.length === 0 && (
                                            <option>Нет данных</option>
                                        )
                                    }
                                </FormSelect>
                            </div>
                        ) : (
                            <LoadingSpinner/>
                        )
                    }

                    <div className={"flex-grow-1"}>
                        <FormLabel column={true} htmlFor={"animalSearch"}>
                            Поиск
                        </FormLabel>
                        <FormControl
                            type="text"
                            name="search"
                            autoComplete="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={e => setDebouncedSearch(e.target.value)}
                            onSubmit={e => setDebouncedSearch(e.target.value)}
                            placeholder="Поиск..."
                        />
                    </div>
                </div>

                <div>
                    <FormLabel column={true} htmlFor={"animalsLimit"} className={"text-nowrap"}>
                        Количество элементов
                    </FormLabel>
                    <FormSelect
                        id={"animalsLimit"}
                        aria-label={"Количество элементов на странице"}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        value={limit}
                    >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                    </FormSelect>
                </div>
            </div>


            <Container className={"animals-card-container mt-4"}>
                {
                    animals && animals.length > 0 && animals.map((animal, i) => (
                        <AnimalCard
                            animal={animal}
                            onClick={handleShowDetailsModal}
                            key={i}
                        />
                    ))
                }
                {
                    loading && <LoadingSpinner/>
                }
            </Container>

            <div className={"d-flex justify-content-center align-items-center mt-4"}>
                <Pagination>
                    {getPaginationItems()}
                </Pagination>
            </div>
        </Container></>
    );
};

export default MainPage;