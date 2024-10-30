import axios from 'axios';
import { Snippet, UpdateSnippet } from '../utils/snippet';

export const updateSnippetFunction = async (id: string, updatedSnippet: UpdateSnippet, token: string): Promise<Snippet | null> => {
    try {
        const response = await axios.put(`/api/snippets/${id}`, updatedSnippet, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        return response.data as Snippet;
    } catch (error) {
        console.error(error);
        return null;
    }
};
