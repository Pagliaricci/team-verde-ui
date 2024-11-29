import { UpdateSnippetResponse } from "../hooks/UpdateSnippetResponse.ts";
import {UpdateSnippet} from "../utils/snippet.ts";
import axios from "axios";

export const updateSnippetFunction = async (
    id: string,
    updatedSnippet: UpdateSnippet,
    token: string
): Promise<UpdateSnippetResponse> => {
    try {
        const response = await axios.put(`http://snippets-service-infra:8080/snippets/update/${id}`, updatedSnippet, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data as UpdateSnippetResponse;
    } catch (error: any) {
        console.error(error);
        throw new Error(error.response?.data?.message || "Error updating snippet");
    }
};
