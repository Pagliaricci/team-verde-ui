import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import { Alert, Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {useUpdateSnippetById, useRunAllSnippetTests, useRunAllTests, useCheckIfOwner} from "../utils/queries.tsx";
import { useFormatSnippet, useGetSnippetById, useShareSnippet } from "../utils/queries.tsx";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import { BugReport, Delete, Download, PlayArrow, Save, Share, StopRounded } from "@mui/icons-material";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import { Snippet } from "../utils/snippet.ts";
import { SnippetExecution } from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { queryClient } from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";

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
  const [shareModalOppened, setShareModalOppened] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [testModalOpened, setTestModalOpened] = useState(false);
  const [runSnippet, setRunSnippet] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const { data: snippet, isLoading } = useGetSnippetById(id);
  const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
  const { mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData } = useFormatSnippet();
    const { mutateAsync: updateSnippet, isLoading: isUpdateSnippetLoading } = useUpdateSnippetById({
        onSuccess: () => {
            queryClient.invalidateQueries(['snippet', id]).then();
        }
    });
    const { mutateAsync: runAllSnippetTests } = useRunAllSnippetTests(id);
    const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
    const { mutateAsync: runAllTests } = useRunAllTests(id);
    const [errors, setErrors] = useState<string[]>([]);
    const isOwner = useCheckIfOwner(snippet && !Array.isArray(snippet) ? snippet.owner : undefined);

    useEffect(() => {
        if (snippet?.content) {
            setCode(snippet.content);
        }
    }, [snippet?.content]);

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

                toast.error(`${passedCount} tests passed, ${failedTests.length} tests failed`);
            } else {
                toast.success("All tests passed 🎉");
            }
        } catch (error) {
            toast.error("Failed to run all tests 😢");
            console.error("Error running tests:", error);
        }
    };

    async function handleShareSnippet(userId: string) {
        shareSnippet({ snippetId: id, userId })
        setShareModalOppened(false)
    }

    const handleUpdateSnippet = async () => {
        if (!snippet || !snippet.id) return;

        updateSnippet(
            { id: snippet.id, updateSnippet: { content: code } },
            {
                onSuccess: (response) => {
                    setStatus({ message: response.message, success: response.message === "Snippet updated" });
                    if (response.message === "Snippet updated") {
                        setCode(response.updatedSnippet?.content || code);
                        setTimeout(() => setStatus(null), 1000);
                    }
                },
                onError: (error) => {
                    setStatus({ message: error.message, success: false });
                },
            }
        );
    };

    const handleClose = () => {
        setErrors([]);
        handleCloseModal();
    }

    return (
        <Box p={4} width={"60vw"}>
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
                    {isOwner ? (
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
                            <Tooltip title={"Format"}>
                                <IconButton
                                    onClick={() => snippet?.id && formatSnippet(snippet.id)}
                                    disabled={isFormatLoading}
                                >
                                    <ReadMore />
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
                                    <Delete color={"error"} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Typography variant="subtitle1" color={"gray"} sx={{ fontStyle: "italic" }}>
                            Snippet is read-only
                        </Typography>
                    )}
                    <Box display={"flex"} gap={2}>
                        <Box
                            flex={1}
                            height={"fit-content"}
                            minHeight={"500px"}
                            bgcolor={"black"}
                            color={"white"}
                        >
                            <Editor
                                value={code}
                                padding={10}
                                onValueChange={setCode}
                                highlight={(code) => highlight(code, languages.js, "javascript")}
                                style={{
                                    minHeight: "500px",
                                    fontFamily: "monospace",
                                    fontSize: 17,
                                }}
                            />
                        </Box>
                    </Box>
                    {isOwner && <SnippetExecution errors={errors} />}
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
