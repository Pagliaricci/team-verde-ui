import axios from 'axios';
import { Snippet } from '../utils/snippet.ts';

export const fetchAllUserSnippets = async (id: string, token: string): Promise<Snippet[] | []> => {
    try {
        const response = await axios.get('http://snippets-service-infra:/snippets/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.map((element: { snippet: { id: string; name: string; languageName: string; languageExtension: string; conformance: string; userId: string; }; author: string; }) => {
            return {
                id: element.snippet.id,
                name: element.snippet.name,
                content: '',
                language: element.snippet.languageName,
                extension: element.snippet.languageExtension,
                compliance: element.snippet.conformance,
                author: element.author,
            };
        });
    } catch (error) {
        console.error(error);
        console.log(id);
        return [];
    }
};