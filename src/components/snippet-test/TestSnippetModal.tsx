import {Box, Divider, IconButton, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useState} from "react";
import {AddRounded} from "@mui/icons-material";
import {useGetTestCases, usePostTestCase, useRemoveTestCase} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";
import {queryClient} from "../../App.tsx";
import {TestCase} from "../../types/TestCase.ts";

type TestSnippetModalProps = {
    open: boolean;
    onClose: () => void;
    snippetId: string;
};

export const TestSnippetModal = ({open, onClose, snippetId}: TestSnippetModalProps) => {
    const [value, setValue] = useState(0);

    const {data: testCases} = useGetTestCases(snippetId);
    const postTestCase = usePostTestCase(snippetId);
    const {mutateAsync: removeTestCase} = useRemoveTestCase({
        onSuccess: () => queryClient.invalidateQueries('testCases'),
    });

    const handleAddTestCase = async (testCase: Partial<TestCase>) => {
        const sanitizedTestCase = {
            ...testCase,
            input: testCase.input && testCase.input.length > 0 ? testCase.input : [],
            output: testCase.output && testCase.output.length > 0 ? testCase.output : [],
        };

        await postTestCase.mutateAsync(sanitizedTestCase);
        await queryClient.invalidateQueries(['testCases', snippetId]);
    };

    const handleRemoveTestCase = async (id: string) => {
        try {
            console.log("Removing test case with ID:", id); // Log para depurar
            await removeTestCase(id); // Eliminar el test
            await queryClient.invalidateQueries('testCases'); // Refrescar la lista
        } catch (error) {
            console.error("Error removing test case:", error); // Manejo de errores
        }
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Test snippet</Typography>
            <Divider/>
            <Box mt={2} display="flex">
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider'}}
                >
                    {testCases?.map((testCase) => (
                        <Tab label={testCase.name} key={testCase.id}/>
                    ))}
                    <IconButton disableRipple onClick={() => setValue((testCases?.length ?? 0) + 1)}>
                        <AddRounded/>
                    </IconButton>
                </Tabs>
                {testCases?.map((testCase, index) => (
                    <TabPanel
                        index={index}
                        value={value}
                        test={testCase}
                        setTestCase={handleAddTestCase}
                        removeTestCase={(id) => handleRemoveTestCase(id)}
                        key={testCase.id}
                    />
                ))}
                <TabPanel
                    index={(testCases?.length ?? 0) + 1}
                    value={value}
                    setTestCase={handleAddTestCase}
                />
            </Box>
        </ModalWrapper>
    );
};
