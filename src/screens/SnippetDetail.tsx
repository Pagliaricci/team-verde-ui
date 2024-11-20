import {useEffect, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {toast} from "react-toastify";
import {useCheckIfOwner, useUpdateSnippetById, useRunAllTests} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById, useShareSnippet} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {Snippet} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import {DeleteConfirmationModal} from "../components/snippet-detail/DeleteConfirmationModal.tsx";

type SnippetDetailProps = {
    id: string;
    handleCloseModal: () => void;
}

const DownloadButton = ({snippet}: { snippet?: Snippet }) => {
    if (!snippet) return null;
    const file = new Blob([snippet.content], {type: 'text/plain'});

    return (
        <Tooltip title={"Download"}>
            <IconButton sx={{
                cursor: "pointer"
            }}>
                <a download={`${snippet.name}.${snippet.extension}`} target="_blank"
                   rel="noreferrer" href={URL.createObjectURL(file)} style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Download/>
                </a>
            </IconButton>
        </Tooltip>
    )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
    const {id, handleCloseModal} = props;
    const [code, setCode] = useState("");
    const [shareModalOppened, setShareModalOppened] = useState(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
    const [testModalOpened, setTestModalOpened] = useState(false);
    const {data: snippet , isLoading} = useGetSnippetById(id);
    const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet()
    const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet()
    const {mutateAsync: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
        onSuccess: () => {
            queryClient.invalidateQueries(['snippet', id]).then();
        }
    });

    const {mutateAsync: runAllTests} = useRunAllTests(id);
    const isOwner = useCheckIfOwner(snippet?.owner);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (snippet) {
            setCode(snippet.content);
        }
    }, [snippet]);

    useEffect(() => {
        if (formatSnippetData) {
            setCode(formatSnippetData)
        }
    }, [formatSnippetData]);

    const handleRunAllTestsToast = async () => {
        try {
            const results = await runAllTests();

            const failedTests = Object.entries(results).filter(([, errors]) => errors.length > 0);
            const passedCount = Object.entries(results).length - failedTests.length;

            const summary = `${passedCount} tests passed, ${failedTests.length} tests failed`;

            if (failedTests.length > 0) {
                setErrors([]);
                const errorMessages = failedTests
                    .map(([testName, errors]) => `Failed test name: ${testName}\n\t${errors.join('\n\t')}`)
            .join('\n');

                const finalLine = `----------------------------------------------------------------------------`;

                setErrors([summary, ...errorMessages.split('\n'), finalLine]);

                toast.error(`${passedCount} tests passed, ${failedTests.length} tests failed)`;
            } else {
                toast.success("All tests passed 🎉");
            }
        } catch (error) {
            toast.error("Failed to run all tests 😢");
            console.error("Error running tests:", error);
        }
    };

    async function handleShareSnippet(userId: string) {
        shareSnippet({snippetId: id, userId})
        setShareModalOppened(false)
    }

    const handleUpdateSnippet = async () => {
        setErrors([]);
        try {
            const response = await updateSnippet({id: id, updateSnippet: {content: code}})

            if (response.errors && response.errors.length > 0) {
                setErrors(response.errors);
            } else {
                handleRunAllTestsToast().then();
            }
        } catch (err) {
            console.error("An error occurred while updating the snippet:", err);
        }

    }

    const handleClose = () => {
        setErrors([]);
        handleCloseModal();
    }

    return (
        <Box p={4} width={'60vw'}>
            <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
                <CloseIcon style={{cursor: "pointer"}} onClick={handleClose}/>
            </Box>
            {
                isLoading ? (<>
                    <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
                    <CircularProgress/>
                </>) : <>
                    <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
                    {isOwner ? (
                        <Box display="flex" flexDirection="row" gap="8px" padding="8px">
                            <Tooltip title={"Share"}>
                                <IconButton onClick={() => setShareModalOppened(true)}>
                                    <Share/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Test"}>
                                <IconButton onClick={() => setTestModalOpened(true)}>
                                    <BugReport/>
                                </IconButton>
                            </Tooltip>
                            <DownloadButton snippet={snippet}/>
                            <Tooltip title={"Format"}>
                                <IconButton onClick={() => {
                                    if (snippet?.id) {
                                        formatSnippet({id: snippet.id, content: code});
                                    } else {
                                        console.error("Snippet ID is undefined");
                                    }
                                }} disabled={isFormatLoading}>
                                    <ReadMoreIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Save changes"}>
                                <IconButton color={"primary"}
                                            onClick={() => handleUpdateSnippet()}
                                            disabled={isUpdateSnippetLoading || snippet?.content === code}>
                                    <Save/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Delete"}>
                                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)}>
                                    <Delete color={"error"}/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box display="flex" flexDirection="row" gap="8px" padding="8px">
                            <Typography variant="subtitle1" padding={1} color={"gray"}
                                        sx={{fontStyle: 'italic'}}>{"Snippet is read only"}</Typography>
                            <Tooltip title={"Test"}>
                                <IconButton onClick={() => setTestModalOpened(true)}>
                                    <BugReport/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    <Box display={"flex"} gap={2}>
                        <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'}
                             color={'white'} code={code}>
                            <Editor
                                value={code}
                                padding={10}
                                onValueChange={(code) => setCode(code)}
                                highlight={(code) => highlight(code, languages.js, "javascript")}
                                maxLength={1000}
                                style={{
                                    minHeight: "500px",
                                    fontFamily: "monospace",
                                    fontSize: 17,
                                }}
                            />
                        </Bòx>
                    </Box>
                    {isOwner &&
                        <Box pt={1} flex={1} marginTop={2}>
                            <Alert severity="info">Output</Alert>
                            <SnippetExecution errors={errors}/>
                        </Box>
                    }
                </>
            }
            <ShareSnippetModal loading={loadingShare || isLoading} open={shareModalOppened}
                               onClose={() => setShareModalOppened(false)}
                               onShare={handleShareSnippet}/>
            <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)} snippetId={id}/>
            <DeleteConfirmationModal open={deleteConfirmationModalOpen}
                                     onClose={() => setDeleteConfirmationModalOpen(false)}
                                     id={snippet?.id ?? ""} setCloseDetails={handleCloseModal}/>
        </Box>
    )
};