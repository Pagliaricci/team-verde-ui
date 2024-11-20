import {fetchAllUserSnippets} from "../../hooks/fetchAllUserSnippets.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "../../utils/snippet.ts";
import {fetchSnippetById} from "../../hooks/fetchSnippetById.ts";
import {createSnippetFunction} from "../../hooks/createSnippetFunction.ts";
import {updateSnippetFunction} from "../../hooks/updateSnippetFunction.ts";
import axios from "axios";
// import {PaginatedUsers} from "../users.ts";
// import {Rule} from "../../types/Rule.ts";
// import {TestCase} from "../../types/TestCase.ts";
// import {TestCaseResult} from "../queries.tsx";
// import {FileType} from "../../types/FileType.ts";

import {Rule} from "../../types/Rule.ts";

const DELAY: number = 1000
export class SnippetManagerService {


     async  createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        return await createSnippetFunction(createSnippet, token) as Snippet;
    }

    public static async fetchAllUserSnippets(id: string): Promise<Snippet[] | []> {
        try{
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            return await fetchAllUserSnippets(id, token) as Snippet[];
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }

     async fetchSnippetById(id: string): Promise<Snippet | []> {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            console.log("juju")
            return await fetchSnippetById(id, token) as Snippet;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No user id found");
        }
        const userSnippets = await SnippetManagerService.fetchAllUserSnippets(token);

        const response: PaginatedSnippets = {
            page: page,
            page_size: pageSize,
            count: 20,
            snippets: page == 0 ? userSnippets.splice(0, pageSize) : userSnippets.splice(1, 2)
        }
        return new Promise(resolve => {
            setTimeout(() => resolve(response), DELAY)
        })
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
            await axios.post(`/snippets/delete/${id}`);
            return `Successfully deleted snippet of id: ${id}`;
        } catch (error) {
            console.error(error);
            return `Snippet of id: ${id} could not be deleted`;
        }
    }

    async shareSnippet(snippetId: string,userId: string ): Promise<string> {
         try {
             const request = {userId: userId, snippetId: snippetId};
             await axios.post(`/snippets/share/${request}`);
             return `Successfully shared snippet of id: ${snippetId}`;
         } catch (error) {
             console.error(error);
             return `Snippet of id: ${snippetId} could not be shared`;
         }
     }
    modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        const userId = "2"; // Hardcodeado temporalmente

        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/saveLintingRules', {
                userId: userId,
                lintingRules: newRules
            })
                .then(response => {
                    resolve(response.data); // Resuelve con la respuesta del backend
                })
                .catch(error => {
                    console.error('Error al guardar las reglas de linting:', error);
                    reject(error); // Rechaza la promesa en caso de error
                });
        });
    }

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        const userId = "2"; // Hardcodeado temporalmente

        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/saveFormatRules', {
                userId: userId,
                lintingRules: newRules
            })
                .then(response => {
                    resolve(response.data); // Resuelve con la respuesta del backend
                })
                .catch(error => {
                    console.error('Error al guardar las reglas de linting:', error);
                    reject(error); // Rechaza la promesa en caso de error
                });
        });
    }


    // getUserFriends(name: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.getUserFriends(name,page,pageSize)), DELAY)
    //     })
    // }
    //
    //
    // getFormatRules(): Promise<Rule[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.getFormatRules()), DELAY)
    //     })
    // }
    //
    // getLintingRules(): Promise<Rule[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.getLintingRules()), DELAY)
    //     })
    // }
    //
    // formatSnippet(snippetContent: string): Promise<string> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.formatSnippet(snippetContent)), DELAY)
    //     })
    // }
    //
    // getTestCases(): Promise<TestCase[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.getTestCases()), DELAY)
    //     })
    // }
    //
    // postTestCase(testCase: TestCase): Promise<TestCase> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.postTestCase(testCase)), DELAY)
    //     })
    // }
    //
    // removeTestCase(id: string): Promise<string> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.removeTestCase(id)), DELAY)
    //     })
    // }
    //
    // testSnippet(): Promise<TestCaseResult> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.testSnippet()), DELAY)
    //     })
    // }
    //
    //
    // getFileTypes(): Promise<FileType[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
    //     })
    // }
    //
    // modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.modifyFormattingRule(newRules)), DELAY)
    //     })
    // }

}