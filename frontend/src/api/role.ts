import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Role = {
    id: number;
    slug: string;
    name: string;
    description: string;
}

export const getRolesPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Role[]>, null>(`/roles/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}