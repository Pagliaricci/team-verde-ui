import axios from 'axios';
import { CreateSnippet, Snippet } from '../utils/snippet';

export const createSnippetFunction = async (snippet: CreateSnippet, token: string): Promise<Snippet | null> => {
    try {
        const response = await axios.post(
            'http://localhost:8083/snippets/create',
            snippet,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data as Snippet;
    } catch (error) {
        console.error(error);
        return null;
    }
}
