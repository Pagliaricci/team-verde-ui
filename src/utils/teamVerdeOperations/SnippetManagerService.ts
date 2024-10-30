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
            return await fetchSnippetById(id, token) as Snippet;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            throw new Error("No user id found");
        }
        const userSnippets = await SnippetManagerService.fetchAllUserSnippets(userId);
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

    // //TODO
    // public static async shareSnippet(snippetId: string): Promise<Snippet> {
    //     return new Promise(resolve => {
    //         // @ts-expect-error, it will always find it in the fake store
    //         setTimeout(() => resolve(this.fakeStore.getSnippetById(snippetId)), DELAY)
    //     })
    // }


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
    //
    // modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    //     return new Promise(resolve => {
    //         setTimeout(() => resolve(this.fakeStore.modifyLintingRule(newRules)), DELAY)
    //     })
    // }
}