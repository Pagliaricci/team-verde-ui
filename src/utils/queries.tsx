import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet.ts';
import {SnippetOperations} from "./snippetOperations.ts";
import {PaginatedUsers} from "./users.ts";
import {FakeSnippetOperations} from "./mock/fakeSnippetOperations.ts";
import {TestCase} from "../types/TestCase.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";
import {useEffect} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {SnippetManagerService} from "./teamVerdeOperations/SnippetManagerService.ts";


export const useSnippetsOperations = () => {
    const { getAccessTokenSilently } = useAuth0()
    useEffect(() => {
        getAccessTokenSilently()
            .then(token => {
                localStorage.setItem('token', token)
            })
    });}

const snippetOperations: SnippetOperations = new FakeSnippetOperations(); // TODO: Replace with your implementation
const realSnippetOperations: SnippetManagerService = new SnippetManagerService();



export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    useSnippetsOperations()
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page, pageSize, snippetName], () => realSnippetOperations.listSnippetDescriptors(page, pageSize), {});
};


export const useGetSnippetById = (id: string) => {
    //çconst snippetOperations = useSnippetsOperations()
    return useQuery<Snippet | [], Error>(['snippet', id], () => realSnippetOperations.fetchSnippetById(id), {
        enabled: !!id, // This query will not execute until the id is provided
    });
};

export const useCreateSnippet = ({ onSuccess, onError }: { onSuccess: () => void, onError: (error: any) => void }): UseMutationResult<Snippet, Error, CreateSnippet> => {
    return useMutation<Snippet, Error, CreateSnippet>(
        createSnippet => realSnippetOperations.createSnippet(createSnippet),
        { onSuccess, onError }
    );
};

export const useUpdateSnippetById = ({onSuccess}: { onSuccess: () => void }): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => realSnippetOperations.updateSnippetById(id, updateSnippet), {
            onSuccess,
        }
    );
};

export const useDeleteSnippet = ({onSuccess}: { onSuccess: () => void }) => {
    return useMutation<string, Error, string>(
        id => realSnippetOperations.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    return useQuery<PaginatedUsers, Error>(['users', name, page, pageSize], () => snippetOperations.getUserFriends(name, page, pageSize));
};

export const useShareSnippet = () => {
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}) => snippetOperations.shareSnippet(snippetId, userId)
    );
};

export const useGetTestCases = (snippetId: string) => {
    return useQuery<TestCase[] | undefined, Error>(
        ['testCases', snippetId],
        () => realSnippetOperations.getTestCases(snippetId),
        {}
    );
};

export const usePostTestCase = (snippetId: string) => {
    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => realSnippetOperations.postTestCase(tc, snippetId)
    );
};

export const useRemoveTestCase = ({onSuccess}: { onSuccess: () => void }) => {
    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id) => realSnippetOperations.removeTestCase(id),
            {
                onSuccess,
            }
    );
};

export type TestCaseResult = "test passed" | "test failed"

export const useTestSnippet = () => {
    return useMutation<TestCaseResult, Error, Partial<TestCase>>(
        (tc) => realSnippetOperations.testSnippet(tc)
    )
}

export const useRunAllSnippetTests = (snippetId: string) => {
    return useMutation<string[], Error>(
        () => realSnippetOperations.runAllTests(snippetId)
    );
};


export const useGetFormatRules = () => {
    return useQuery<Rule[], Error>('formatRules', () =>  realSnippetOperations.getFormattingRules());
}

export const useModifyFormatRules = ({onSuccess}: { onSuccess: () => void }) => {
    return useMutation<Rule[], Error, Rule[]>(
        rule => realSnippetOperations.modifyFormatRule(rule),
        {onSuccess}
    );
}


export const useGetLintingRules = () => {
    return useQuery<Rule[], Error>('lintingRules', () => realSnippetOperations.getLintingRules());
}


export const useModifyLintingRules = ({onSuccess}: { onSuccess: () => void }) => {
    return useMutation<Rule[], Error, Rule[]>(
        rule => realSnippetOperations.modifyLintingRule(rule),
        {onSuccess}
    );
}

export const useFormatSnippet = () => {
    return useMutation<string, Error, { id: string, content: string }>(
        ({id, content}) => realSnippetOperations.formatSnippet(id, content)
    );
}


export const useGetFileTypes = () => {
    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}