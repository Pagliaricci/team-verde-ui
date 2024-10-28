import axios from "axios";
import { Snippet } from "../utils/snippet";

export const fetchSnippetById = async (id: string, token: string): Promise<Snippet | null> => {
  try {
    const response = await axios.get(`/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.data as Snippet;
  } catch (error) {
    console.error(error);
    return null;
  }
};
