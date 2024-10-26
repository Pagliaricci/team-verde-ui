import axios from 'axios';
import {Snippet} from "../utils/snippet.ts";

export const fetchAllUserSnippets = async(id:string, token:string): Promise<Snippet[]| []> => {
    try{
        const response = await axios.get(`/user/${id}/snippets`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return response.data as Snippet[];
    } catch (error){
        console.error(error);
        return [];

    }
}