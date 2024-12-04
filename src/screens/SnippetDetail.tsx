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
import { useUpdateSnippetById, useRunAllSnippetTests } from "../utils/queries.tsx";
import {
    useFormatSnippet,
    useGetSnippetById,
    useShareSnippet,
} from "../utils/queries.tsx";
import { Snippet } from "../utils/snippet.ts";
import { SnippetExecution } from "./SnippetExecution.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-detail/TestSnippetModal.tsx";
import {
    BugReport,
    Delete,
    Download,
    PlayArrow,
    Save,
    Share,
    StopRounded,
} from "@mui/icons-material";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
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
                URL.revokeObjectURL(url);
            };
        }
    }, [snippet]);

    if (!fileUrl) return null;

    return (
        <Tooltip title={"Download"}>
            <IconButton sx={{ cursor: "pointer" }}>
                <a
                    download={`${snippet?.name}.${snippet?.extension}`}
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
    const [errors, setErrors] = useState<string[]>([]);
    const [testResults, setTestResults] = useState<string | null>(null);
    const [shareModalOpened, setShareModalOpened] = useState(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
        useState(false);
    const [testModalOpened, setTestModalOpened] = useState(false);
    const [runSnippet, setRunSnippet] = useState(false);
    const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);

    const { data: snippet, isLoading } = useGetSnippetById(id);
    const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
    const { mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData } =
        useFormatSnippet();
    const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } =
        useUpdateSnippetById({
            onSuccess: () => queryClient.invalidateQueries(["snippet", id]),
        });
    const { mutateAsync: runAllSnippetTests } = useRunAllSnippetTests(id);

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

    const handleRunAllTestsToast = async () => {
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
    };

    const handleUpdateSnippet = async () => {
        setErrors([]);
        setTestResults(null);
        try {
            const response = await updateSnippet({ id: id, updateSnippet: { content: code } });

            // Show the update response message
            setStatus({ message: response.message, success: response.message === "Snippet updated" });

            if (response.message === "Snippet updated") {
                // Update snippet content if update is successful
                setCode(response.updatedSnippet?.content || code);

                // Run tests only after the snippet update is successful
                setTimeout(() => {
                    handleRunAllTestsToast();
                }, 1000); // Add a slight delay to ensure the update is complete before running tests
            } else {
                setStatus({ message: response.message, success: false });
            }
        } catch (err) {
            setStatus({ message: "Error updating snippet. Please try again.", success: false });
            console.error("Update error:", err);
        }
    };

    async function handleShareSnippet(userId: string) {
        shareSnippet({ snippetId: id, userId });
    }

    return (
        <Box p={4} minWidth={"60vw"}>
            <Box width={"100%"} p={2} display={"flex"} justifyContent={"flex-end"}>
                <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
            </Box>
            {status && (
                <Box mt={2}>
                    <Alert severity={status.success ? "success" : "error"}>{status.message}</Alert>
                </Box>
            )}
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
                                disabled={isUpdateSnippetLoading || snippet?.content === code}
                            >
                                <Save />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Delete"}>
                            <IconButton onClick={() => setDeleteConfirmationModalOpen(true)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Editor
                        value={code}
                        onValueChange={setCode}
                        highlight={(code) => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                            minHeight: "60vh",
                            backgroundColor: "#282c34",
                            color: "#f8f8f2",
                        }}
                    />

                    {testResults && (
                        <Typography variant="h5" mt={2}>
                            Test Results: {testResults}
                        </Typography>
                    )}
                </>
            )}
            <TestSnippetModal
                open={testModalOpened}
                onClose={() => setTestModalOpened(false)}
                onRunTests={handleRunAllTestsToast}
            />
            <ShareSnippetModal
                open={shareModalOpened}
                onClose={() => setShareModalOpened(false)}
                onShare={handleShareSnippet}
                snippetId={id}
            />
            <DeleteConfirmationModal
                open={deleteConfirmationModalOpen}
                onClose={() => setDeleteConfirmationModalOpen(false)}
                snippetId={id}
            />
        </Box>
    );
};
