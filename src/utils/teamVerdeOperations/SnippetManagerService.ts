import { fetchAllUserSnippets } from "../../hooks/fetchAllUserSnippets";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../../utils/snippet";
import { fetchSnippetById } from "../../hooks/fetchSnippetById";
import { createSnippetFunction } from "../../hooks/createSnippetFunction";
import { updateSnippetFunction } from "../../hooks/updateSnippetFunction";
import axios from "axios";
import { Rule } from "../../types/Rule";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";

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
            localStorage.setItem("snippetId", id);
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
        const response = await axios.get('http://localhost:8083/getFormattingRules', {
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
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        if (!snippetId) {
            throw new Error("SnippetId is needed to show snippet's tests");
        }
        const response = await axios.get(`http://localhost:8083/api/test/snippet/${snippetId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return Array.isArray(response.data) ? response.data : [];
    }

    async postTestCase(testCase: Partial<TestCase>, snippetId: string): Promise<TestCase> {
    console.log(snippetId)
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No token found");
    }
    if (!snippetId) {
        throw new Error("SnippetId is needed to post a test case");
    }
    if (!testCase.input || !testCase.output) {
        throw new Error("Input and output are required for a test case");
    }
    const response = await axios.post(`http://localhost:8083/api/test/snippet/${snippetId}`, testCase, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

    async removeTestCase(testId: string): Promise<string> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        if (!testId) {
            throw new Error("TestCaseId is needed to remove a test case");
        }
        const response = await axios.delete(`http://localhost:8083/api/test/${testId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(`test with id: ${testId} removed`)
        return response.data;
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        if (!testCase.id) {
            throw new Error("Test ID is required to run a test");
        }

        const response = await axios.post(
            `http://localhost:8083/api/test/${testCase.id}/run`,
            { input: testCase.input, output: testCase.output },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log(response.data as TestCaseResult)
        return response.data as TestCaseResult;
    }


    async runAllTests(snippetId: string): Promise<string[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        const response = await axios.post(`http://localhost:8083/api/test/${snippetId}/all`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status != 200){
            throw new Error("Failed to run all tests");
        }
        return response.data as string[];
    }
}
