import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Coloring = {
    id: number;
    name: string;
    image_link: string;
    breed_id: number;
}

export type ColoringRequest = {
    id: number;
    name: string;
    image_link: string;
    breed_id: number;
    new_image: string;
}

export const getColoringsPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Coloring[]>, null>(`/colorings/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const getColoringsByBreedId = async(breed_id: number)=> {
    return await sendRequest<Coloring[], null>(`/colorings?breed_id=${breed_id}`, RequestMethods.GET)
}

export const addColoring = async(coloring: ColoringRequest) => {
    return await sendRequest<null, ColoringRequest>(`/admin/colorings`, RequestMethods.POST, coloring)
}

export const updateColoring = async(coloring: ColoringRequest) => {
    return await sendRequest<null, ColoringRequest>(`/admin/colorings`, RequestMethods.PUT, coloring)
}

export const deleteColoring = async(id: number) => {
    return await sendRequest<null, null>(`/admin/colorings?id=${id}`, RequestMethods.DELETE)
}