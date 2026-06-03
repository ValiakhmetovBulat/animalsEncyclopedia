import type {Type} from "./type.ts";
import type {Breed} from "./breed.ts";
import type {Country} from "./country.ts";
import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Animal = {
    id: number;
    name: string;
    description: string;
    type_id: number;
    type?: Type | null;
    country_id: number;
    country?: Country | null;
    breed_id: number;
    breed?: Breed | null;
    image_link: string;
}

export type AnimalRequest = {
    id: number;
    name: string;
    description: string;
    type_id: number;
    country_id: number;
    breed_id: number;
    image_link: string;
    new_image: string;
}

export type AnimalOption = {
    id: number;
    name: string;
}

export const getAnimalsPaginated = async(
    page: number = 1,
    limit: number = 10,
    selectedTypeId: number = 0,
    selectedBreedId: number = 0,
    selectedCountryId: number = 0,
    search: string = ""
) => {
    return await sendRequest<PaginatedResponse<Animal[]>, null>(
        `/animals?page=${page}&limit=${limit}&type=${selectedTypeId}&breed=${selectedBreedId}&country=${selectedCountryId}&search=${search}`,
        RequestMethods.GET
    )
}

export const getAnimalsOptions = async() => {
    return await sendRequest<AnimalOption[], null>(`/animals/options`, RequestMethods.GET)
}

export const addAnimal = async(a: AnimalRequest) => {
    return await sendRequest<null, AnimalRequest>(`/admin/animals`, RequestMethods.POST, a)
}

export const updateAnimal = async(a: AnimalRequest) => {
    return await sendRequest<null, AnimalRequest>(`/admin/animals`, RequestMethods.PUT, a)
}

export const deleteAnimal = async(id: number) => {
    return await sendRequest<null, null>(`/admin/animals?id=${id}`, RequestMethods.DELETE)
}