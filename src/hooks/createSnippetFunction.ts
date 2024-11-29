import axios from 'axios';
import { CreateSnippet, Snippet } from '../utils/snippet';

export const createSnippetFunction = async (snippet: CreateSnippet, token: string): Promise<Snippet | string> => {
    console.log("Sending createSnippet request:", snippet);  // Log del objeto enviado

    try {
        const response = await axios.post(
            'https://teamverde.westus2.cloudapp.azure.com/snippets/create',
            snippet,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Received response from backend:", response.data);  // Log de la respuesta del backend
        if(response.data.message != ""){
            return response.data.message;
        }
        return response.data as Snippet;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Si es un error de Axios con respuesta del backend
            console.error("Error occurred while creating snippet:", error.response.data);  // Log del error
            return error.response.data.message || "Error: Unable to create snippet";  // Mostrar el mensaje de error
        } else {
            console.error("Error occurred:", error);  // Log de cualquier otro error
            return "Error: Unable to create snippet";
        }
    }
};
