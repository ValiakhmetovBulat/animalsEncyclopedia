import {create} from "zustand"
import {getCountries, type Country} from "../../api/country.ts";

type CountriesState = {
    countries: Country[] | null
    error: string
    message: string
    getCountries: () => ReturnType<typeof getCountries>
}

export const useCountries = create<CountriesState>((set) => ({
    countries: null,
    error: "",
    message: "",

    getCountries: async() => {
        const resp = await getCountries();

        set({
            countries: resp.data?.data,
            error: resp.data?.error ?? "",
            message: resp.data?.message ?? "",
        })

        return resp
    },
}))