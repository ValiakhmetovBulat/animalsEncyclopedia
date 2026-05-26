import type {Type} from "./type.ts";
import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Breed = {
    id: number;
    name: string;
    type_id: number;
    type?: Type | null;
}

export type BreedOption = {
    id: number;
    name: string;
}

export const getBreeds = async() => {
    return await sendRequest<Breed[], null>(`/breeds`, RequestMethods.GET)
}

export const getBreedsPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Breed[]>, null>(`/breeds/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const addBreed = async(breed: Breed) => {
    return await sendRequest<null, Breed>(`/admin/breeds`, RequestMethods.POST, breed)
}

export const updateBreed = async(breed: Breed) => {
    return await sendRequest<null, Breed>(`/admin/breeds`, RequestMethods.PUT, breed)
}

export const deleteBreed = async(id: number) => {
    return await sendRequest<null, null>(`/admin/breeds?id=${id}`, RequestMethods.DELETE)
}

export const getBreedOptions = async() => {
    return await sendRequest<BreedOption[], null>(`/breeds/options`, RequestMethods.GET)
}

export const getBreedOptionsWithTypeId = async(typeId: number) => {
    return await sendRequest<BreedOption[], null>(`/breeds/options?id=${typeId}`, RequestMethods.GET)
}