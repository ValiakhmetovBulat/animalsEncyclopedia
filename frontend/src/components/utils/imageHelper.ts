import {baseUrl} from "../../api/client.ts";

export const GetImageUrl = (img: string) => {
    return `${baseUrl}/static/${img}`
}