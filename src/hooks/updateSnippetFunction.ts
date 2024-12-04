import { UpdateSnippetResponse } from "./UpdateSnippetResponse.ts";
import {UpdateSnippet} from "../utils/snippet.ts";
import axios from "axios";
import {SnippetManagerService} from "../utils/teamVerdeOperations/SnippetManagerService.ts";

export const updateSnippetFunction = async (
    id: string,
    updatedSnippet: UpdateSnippet,
    token: string
): Promise<UpdateSnippetResponse> => {
    try {
        const response = await axios.put(`https://teamverde.westus2.cloudapp.azure.com/snippets/update/${id}`, updatedSnippet, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        await new SnippetManagerService().runAllTests(id);
        return response.data as UpdateSnippetResponse;
    } catch (error: any) {
        console.error(error);

        throw new Error(error.response?.data?.message || "Error updating snippet");
    }
};
