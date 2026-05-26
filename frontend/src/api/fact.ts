import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Fact = {
    id: number;
    text: string;
    animal_id: number;
}

export const getFactsByAnimalId = async (animal_id: number) => {
    return await sendRequest<Fact[], null>(`/facts?animalId=${animal_id}`, RequestMethods.GET)
}

export const getFactsPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Fact[]>, null>(`/facts/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const addFact = async(fact: Fact) => {
    return await sendRequest<null, Fact>(`/admin/facts`, RequestMethods.POST, fact)
}

export const updateFact = async(fact: Fact) => {
    return await sendRequest<null, Fact>(`/admin/facts`, RequestMethods.PUT, fact)
}

export const deleteFact = async(id: number) => {
    return await sendRequest<null, null>(`/admin/facts?id=${id}`, RequestMethods.DELETE)
}