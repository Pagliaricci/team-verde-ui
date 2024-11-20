import axios from "axios";
import { Snippet } from "../utils/snippet";

export const fetchSnippetById = async (id: string, token: string): Promise<Snippet | null> => {
  try {
    console.log("AAAAAAAA")
    console.log(id)
    const response = await axios.get(`http://localhost:8083/snippets/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const snippet : Snippet = {
        id: response.data.id,
        name: response.data.name,
        content: response.data.content,
        language: response.data.languageName,
        extension: response.data.languageExtension,
        compliance: response.data.conformance,
        author: response.data.userId,
    }
    console.log("BBBBBBB")
    console.log(snippet)
    return snippet;
  } catch (error) {
    console.error(error);
    return null;
  }
};
