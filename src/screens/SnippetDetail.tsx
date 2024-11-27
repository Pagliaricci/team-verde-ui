import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdateSnippetById, useRunAllSnippetTests } from "../utils/queries.tsx"; // Added useRunAllSnippetTests
import {
    useFormatSnippet,
    useGetSnippetById,
    useShareSnippet,
} from "../utils/queries.tsx";
import { Snippet } from "../utils/snippet.ts";
import { SnippetExecution } from "./SnippetExecution.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import {
    BugReport,
    Delete,
    Download,
    PlayArrow,
    Save,
    Share,
    StopRounded,
} from "@mui/icons-material";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { queryClient } from "../App.tsx";

type SnippetDetailProps = {
    id: string;
    handleCloseModal: () => void;
};

const DownloadButton = ({ snippet }: { snippet?: Snippet }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (snippet?.content && snippet?.name && snippet?.extension) {
            const file = new Blob([snippet.content], { type: "text/plain" });
            const url = URL.createObjectURL(file);
            setFileUrl(url);

            return () => {
                URL.revokeObjectURL(url); // Free memory
            };
        }
    }, [snippet]);

    if (!fileUrl) return null;

    return (
        <Tooltip title={"Download"}>
            <IconButton sx={{ cursor: "pointer" }}>
                <a
                    download={`${snippet.name}.${snippet.extension}`}
                    target="_blank"
                    rel="noreferrer"
                    href={fileUrl}
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Download />
                </a>
            </IconButton>
        </Tooltip>
    );
};

export const SnippetDetail = (props: SnippetDetailProps) => {
    const { id, handleCloseModal } = props;
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState<string[]>([]); // Test error messages
    const [testResults, setTestResults] = useState<string | null>(null); // Test results summary
    const [shareModalOpened, setShareModalOpened] = useState(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
        useState(false);
    const [testModalOpened, setTestModalOpened] = useState(false);
    const [runSnippet, setRunSnippet] = useState(false);

    const { data: snippet, isLoading } = useGetSnippetById(id);
    const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
    const { mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData } =
        useFormatSnippet();
    const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } =
        useUpdateSnippetById({
            onSuccess: () => queryClient.invalidateQueries(["snippet", id]),
        });
    const { mutateAsync: runAllSnippetTests } = useRunAllSnippetTests(id); // Add run all tests logic

    useEffect(() => {
        if (snippet?.content) {
            setCode(snippet.content);
        }
    }, [snippet?.content]);

    useEffect(() => {
        if (formatSnippetData) {
            setCode(formatSnippetData);
        }
    }, [formatSnippetData]);

    async function handleRunAllTestsToast() {
        try {
            const testErrors = await runAllSnippetTests(id);

            console.log("Test errors response:", testErrors); // Debug response

            if (Array.isArray(testErrors)) {
                if (testErrors.length === 0) {
                    setTestResults("All tests passed successfully.");
                } else {
                    setTestResults(
                        `Some tests failed:\n${testErrors.map(
                            (error) => `Test: ${error.name} - ${error.error}`
                        ).join("\n")}`
                    );
                }
            } else if (typeof testErrors === "object" && testErrors !== null) {
                const failedTests = Object.entries(testErrors)
                    .filter(([testName, errors]) => errors.length > 0)
                    .map(([testName, errors]) => `Test: ${testName} - ${errors.join(", ")}`)
                    .join("\n");

                if (failedTests) {
                    setTestResults(`Some tests failed:\n${failedTests}`);
                } else {
                    setTestResults("All tests passed successfully.");
                }
            } else {
                setTestResults("Unexpected test results format.");
                console.error("Unexpected test results format:", testErrors);
            }
        } catch (err) {
            setTestResults("Failed to run all tests. Please try again later.");
            console.error("Error running tests:", err);
        }
    }



    async function handleUpdateSnippet() {
        setErrors([]);
        setTestResults(null);

        try {
            await updateSnippet({ id: id, updateSnippet: { content: code } });

            // Run tests after updating snippet
            await handleRunAllTestsToast();
        } catch (err) {
            setTestResults("Error updating snippet. Please try again.");
            console.error("Update error:", err);
        }
    }

    async function handleShareSnippet(userId: string) {
        shareSnippet({ snippetId: id, userId });
    }

    return (
        <Box p={4} minWidth={"60vw"}>
            <Box width={"100%"} p={2} display={"flex"} justifyContent={"flex-end"}>
                <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
            </Box>
            {isLoading ? (
                <>
                    <Typography fontWeight={"bold"} mb={2} variant="h4">
                        Loading...
                    </Typography>
                    <CircularProgress />
                </>
            ) : (
                <>
                    <Typography variant="h4" fontWeight={"bold"}>
                        {snippet?.name || "Snippet"}
                    </Typography>
                    <Box display="flex" flexDirection="row" gap="8px" padding="8px">
                        <Tooltip title={"Share"}>
                            <IconButton onClick={() => setShareModalOpened(true)}>
                                <Share />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Test"}>
                            <IconButton onClick={() => setTestModalOpened(true)}>
                                <BugReport />
                            </IconButton>
                        </Tooltip>
                        <DownloadButton snippet={snippet} />
                        <Tooltip title={runSnippet ? "Stop run" : "Run"}>
                            <IconButton onClick={() => setRunSnippet(!runSnippet)}>
                                {runSnippet ? <StopRounded /> : <PlayArrow />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Format"}>
                            <IconButton
                                onClick={() => {
                                    if (snippet?.id) {
                                        formatSnippet({ id: snippet.id, content: code });
                                    } else {
                                        console.error("Snippet ID is undefined");
                                    }
                                }}
                                disabled={isFormatLoading}
                            >
                                <ReadMoreIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Save changes"}>
                            <IconButton
                                color={"primary"}
                                onClick={handleUpdateSnippet}
                                disabled={
                                    isUpdateSnippetLoading || snippet?.content === code
                                }
                            >
                                <Save />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Delete"}>
                            <IconButton onClick={() => setDeleteConfirmationModalOpen(true)}>
                                <Delete color={"error"} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box display={"flex"} gap={2}>
                        <Box
                            flex={1}
                            height={"fit-content"}
                            overflow={"none"}
                            minHeight={"500px"}
                            bgcolor={"black"}
                            color={"white"}
                        >
                            <Editor
                                value={code}
                                padding={10}
                                onValueChange={(code) => setCode(code)}
                                highlight={(code) =>
                                    highlight(code, languages.js, "javascript")
                                }
                                style={{
                                    minHeight: "500px",
                                    fontFamily: "monospace",
                                    fontSize: 17,
                                }}
                            />
                        </Box>
                    </Box>
                    <Box pt={1} flex={1} marginTop={2}>
                        <Alert severity="info">Output</Alert>
                        <SnippetExecution />
                    </Box>
                    {testResults && (
                        <Box pt={2}>
                            <Alert severity="info">{testResults}</Alert>
                        </Box>
                    )}
                </>
            )}
            <ShareSnippetModal
                loading={loadingShare || isLoading}
                open={shareModalOpened}
                onClose={() => setShareModalOpened(false)}
                onShare={handleShareSnippet}
            />
            <TestSnippetModal
                open={testModalOpened}
                onClose={() => setTestModalOpened(false)}
                snippetId={id}
            />
            <DeleteConfirmationModal
                open={deleteConfirmationModalOpen}
                onClose={() => setDeleteConfirmationModalOpen(false)}
                id={snippet?.id || ""}
                setCloseDetails={handleCloseModal}
            />
        </Box>
    );
};
