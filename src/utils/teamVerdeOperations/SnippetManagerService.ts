import { fetchAllUserSnippets } from "../../hooks/fetchAllUserSnippets";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../../utils/snippet";
import { fetchSnippetById } from "../../hooks/fetchSnippetById";
import { createSnippetFunction } from "../../hooks/createSnippetFunction";
import { updateSnippetFunction } from "../../hooks/updateSnippetFunction";
import axios from "axios";
import { Rule } from "../../types/Rule";
import {TestCase} from "../../types/TestCase.ts";

const DELAY: number = 1000;

export class SnippetManagerService {


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
            await axios.delete(`http://localhost:8083/snippets/delete/${id}`, {
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

    async getFormattingRules(): Promise<Rule[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        const response = await axios.get('http://localhost:8083/snippets/getFormattingRules', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data as Promise<Rule[]>;
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(newRules);
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        return await axios.post('http://localhost:8083/modifyFormattingRules', newRules, {
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
        const response = await axios.get('http://localhost:8083/getLintingRules', {
            headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        return response.data as Promise<Rule[]>;
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(newRules);
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        return await axios.post('http://localhost:8083/modifyLintingRules', newRules, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => response.data);
    }
    async formatSnippet(snippetId: string, snippetContent: string): Promise<string> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        const formattingRequest = {
            snippetId, // Clave: snippetId
            content: snippetContent, // Clave: content
        };

        return axios
            .post("http://localhost:8083/formatSnippet", formattingRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json", // Asegúrate de usar JSON como formato
                },
            })
            .then(response => response.data)
            .catch(error => {
                console.error("Error formatting snippet:", error);
                throw error;
            });
    }


    async getTestCases(snippetId: string): Promise<TestCase[]> {
        if (!snippetId) {
            throw new Error("SnippetId is needed to show snippet's tests");
        }

        const response = await axios.get('http://localhost:8083/snippets/test/snippet/${snippetId}');
        return Array.isArray(response.data) ? response.data : [];
    }

    async postTestCase(testCase: Partial<TestCase>, snippetId: string): Promise<TestCase> {
        if (!snippetId) {
            throw new Error("SnippetId is needed to post a test case");
        }
        if (!testCase.input || !testCase.output) {
            throw new Error("Input and output are required for a test case");
        }
        const response = await axios.post('http://localhost:8083/snippets/test/snippet/${snippetId}', testCase);
        return response.data;
    }

    async removeTestCase(testId: string): Promise<string> {
        if (!testId) {
            throw new Error("TestCaseId is needed to remove a test case");
        }
        const response = await axios.delete('http://localhost:8083/snippets/test/${id}');
        return response.data;
    }
}
