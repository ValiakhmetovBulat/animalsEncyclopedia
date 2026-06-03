import {create} from "zustand"
import {getTypes, type Type} from "../../api/type.ts";

type TypesState = {
    types: Type[] | null
    error: string
    message: string
    getTypes: () => ReturnType<typeof getTypes>
}

export const useTypes = create<TypesState>((set) => ({
    types: null,
    error: "",
    message: "",

    getTypes: async() => {
        const resp = await getTypes();

        set({
            types: resp.data?.data,
            error: resp.data?.error ?? "",
            message: resp.data?.message ?? "",
        })

        return resp
    },
}))