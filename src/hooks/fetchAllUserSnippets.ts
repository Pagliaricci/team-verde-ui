import axios from 'axios';
import { Snippet } from '../utils/snippet.ts';

export const fetchAllUserSnippets = async (id: string, token: string): Promise<Snippet[] | []> => {
    try {
        const response = await axios.get('http://localhost:8083/snippets/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.map((element: { id: string; name: string; languageName: string; languageExtension: string; conformance: string; userId: string; }) => {
            return {
                id: element.id,
                name: element.name,
                content: '',
                language: element.languageName,
                extension: element.languageExtension,
                compliance: element.conformance,
                author: element.userId,
            };
        });
    } catch (error) {
        console.error(error);
        console.log(id);
        return [];
    }
};