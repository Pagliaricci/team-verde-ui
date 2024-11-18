import axios from 'axios';
import {Snippet} from "../utils/snippet.ts";

export const fetchAllUserSnippets = async(id:string, token:string): Promise<Snippet[]| []> => {
    try{
        console.log("MONEYWISE")
        const response = await axios.get(`http://localhost:8083/snippets/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data as Snippet[];
    } catch (error){
        console.error(error);
        console.log(id)
        return [];

    }
}