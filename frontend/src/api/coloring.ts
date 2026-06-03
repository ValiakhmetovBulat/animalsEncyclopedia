import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Coloring = {
    id: number;
    name: string;
    image_link: string;
    breed_id: number;
}

export const getColoringsPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Coloring[]>, null>(`/colorings/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const getColoringsByBreedId = async(breed_id: number)=> {
    return await sendRequest<Coloring[], null>(`/colorings?breed_id=${breed_id}`, RequestMethods.GET)
}