import {type PaginatedResponse, sendRequest} from "./client.ts";
import {RequestMethods} from "./request_methods.ts";

export type Country = {
    id: number;
    name: string;
}

export type CountryOption = {
    id: number;
    name: string;
}

export const getCountries = async() => {
    return await sendRequest<Country[], null>(`/countries`, RequestMethods.GET)
}

export const getCountriesPaginated = async(page: number, limit: number)=> {
    return await sendRequest<PaginatedResponse<Country[]>, null>(`/countries/paginated?page=${page}&limit=${limit}`, RequestMethods.GET)
}

export const addCountry = async(country: Country) => {
    return await sendRequest<null, Country>(`/admin/countries`, RequestMethods.POST, country)
}

export const updateCountry = async(country: Country) => {
    return await sendRequest<null, Country>(`/admin/countries`, RequestMethods.PUT, country)
}

export const deleteCountry = async(id: number) => {
    return await sendRequest<null, null>(`/admin/countries?id=${id}`, RequestMethods.DELETE)
}

export const getCountriesOptions = async() => {
    return await sendRequest<CountryOption[], null>(`/countries/options`, RequestMethods.GET)
}