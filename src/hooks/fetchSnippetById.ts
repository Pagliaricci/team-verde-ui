import axios from "axios";
import {Snippet} from "../utils/snippet";

export const fetchSnippetById = async (id: string, token: string): Promise<Snippet | null> => {
  try {
    const response = await axios.get(`https://teamverde.westus2.cloudapp.azure.com/snippets/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
      return {
        id: response.data.id,
        name: response.data.name,
        content: response.data.content,
        language: response.data.languageName,
        extension: response.data.languageExtension,
        compliance: response.data.conformance,
        author: response.data.username,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
