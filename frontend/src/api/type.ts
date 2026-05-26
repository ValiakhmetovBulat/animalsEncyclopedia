import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Type = {
    id: number;
    name: string;
}

export type TypeOption = {
    id: number;
    name: string;
}

export const getTypes = async() => {
    return await sendRequest<Type[], null>(`/types`, RequestMethods.GET)
}

export const getTypesPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Type[]>, null>(`/types/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const addType = async(t: Type) => {
    return await sendRequest<null, Type>(`/admin/types`, RequestMethods.POST, t)
}

export const updateType = async(t: Type) => {
    return await sendRequest<null, Type>(`/admin/types`, RequestMethods.PUT, t)
}

export const deleteType = async(id: number) => {
    return await sendRequest<null, null>(`/admin/types?id=${id}`, RequestMethods.DELETE)
}

export const getTypesOptions = async() => {
    return await sendRequest<TypeOption[], null>(`/types/options`, RequestMethods.GET)
}