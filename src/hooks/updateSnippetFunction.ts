import { UpdateSnippetResponse } from "../hooks/UpdateSnippetResponse.ts";
import {UpdateSnippet} from "../utils/snippet.ts";
import api from "../utils/teamVerdeOperations/api.ts";

export const updateSnippetFunction = async (
    id: string,
    updatedSnippet: UpdateSnippet,
    token: string
): Promise<UpdateSnippetResponse> => {
    try {
        const response = await api.put(`snippets/update/${id}`, updatedSnippet);
        return response.data as UpdateSnippetResponse;
    } catch (error: any) {
        console.error(error);
        throw new Error(error.response?.data?.message || "Error updating snippet");
    }
};
