import {create} from "zustand"
import {getBreeds, type Breed} from "../../api/breed.ts";

type BreedsState = {
    breeds: Breed[] | null
    error: string
    message: string
    getBreeds: () => ReturnType<typeof getBreeds>
}

export const useBreeds = create<BreedsState>((set) => ({
    breeds: null,
    error: "",
    message: "",

    getBreeds: async() => {
        const resp = await getBreeds();

        set({
            breeds: resp.data?.data,
            error: resp.data?.error ?? "",
            message: resp.data?.message ?? "",
        })

        return resp
    },
}))