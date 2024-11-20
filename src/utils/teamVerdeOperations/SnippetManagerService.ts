import { fetchAllUserSnippets } from "../../hooks/fetchAllUserSnippets";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../../utils/snippet";
import { fetchSnippetById } from "../../hooks/fetchSnippetById";
import { createSnippetFunction } from "../../hooks/createSnippetFunction";
import { updateSnippetFunction } from "../../hooks/updateSnippetFunction";
import axios from "axios";
import { Rule } from "../../types/Rule";
import { FakeSnippetStore } from '../mock/fakeSnippetStore';

const DELAY: number = 1000;

export class SnippetManagerService {

    private readonly fakeStore = new FakeSnippetStore();
    private readonly defaultLintingRules = this.fakeStore.getLintingRules();
    private readonly defaultFormattingRules = this.fakeStore.getFormatRules();

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        return await createSnippetFunction(createSnippet, token) as Snippet;
    }

    public static async fetchAllUserSnippets(id: string): Promise<Snippet[]> {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            return await fetchAllUserSnippets(id, token) as Snippet[];
        } catch (error) {
            console.error('Error fetching all user snippets:', error);
            return [];
        }
    }

    async fetchSnippetById(id: string): Promise<Snippet> {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            return await fetchSnippetById(id, token) as Snippet;
        } catch (error) {
            console.error('Error fetching snippet by ID:', error);
            throw error;
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        const userSnippets = await SnippetManagerService.fetchAllUserSnippets("USER_ID"); // Reemplazar con el ID del usuario real
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;

        const response: PaginatedSnippets = {
            page,
            page_size: pageSize,
            count: userSnippets.length,
            snippets: userSnippets.slice(startIndex, endIndex),
        };

        return new Promise(resolve => {
            setTimeout(() => resolve(response), DELAY);
        });
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        return await updateSnippetFunction(id, updateSnippet, token) as Snippet;
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            await axios.delete(`http://localhost:8083/snippets/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return `Successfully deleted snippet of id: ${id}`;
        } catch (error) {
            console.error('Error deleting snippet:', error);
            throw error;
        }
    }

    async shareSnippet(snippetId: string, userId: string): Promise<string> {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            await axios.post(`http://localhost:8083/snippets/share`, { userId, snippetId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return `Successfully shared snippet of id: ${snippetId}`;
        } catch (error) {
            console.error('Error sharing snippet:', error);
            throw error;
        }
    }

    getFormattingRules(): Promise<Rule[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        return axios.get('http://localhost:8083/snippets/getFormattingRules', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => response.data)
            .catch(async () => {
                // Fallback: create default linting rules
                return axios.post('http://localhost:8083/snippets/createFormatRules', { rules: this.defaultFormattingRules }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).then(response => response.data);
            });
    }

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        return axios.post('http://localhost:8080/modifyFormattingRules', { formattingRules: newRules }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => response.data);
    }

    async getLintingRules(): Promise<Rule[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        const response = await axios.get('http://localhost:8083/snippets/getLintingRules', {
            headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Fetched linting rules:", response.data);
            if (response.data.length == 0) {
                const response_1 = await axios.post('http://localhost:8083/snippets/createLintingRules',     { rules: JSON.stringify(this.defaultLintingRules) }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Default linting rules created:", response_1.data);
                return response_1.data;
            }
            return response.data;
        }

    modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        return axios.post('http://localhost:8083/modifyLintingRules', { lintingRules: newRules }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => response.data);
    }
}
