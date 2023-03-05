import { Button, Code, FileButton, Flex, List, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useState } from "react";

export default function UploadCsvModal({ onClickHandler }: { onClickHandler: (file: File) => void }) {
    const [file, setFile] = useState<File | null>(null);
    return (
        <>
            <Flex justify="center" direction="column" >
                <List>
                    <List.Item>Your CSV must have a header row</List.Item>
                    <List.Item>The first two columns must have <Code>term</Code> and <Code>definition</Code> as the headers</List.Item>
                    <List.Item>Your headers should all be lowercase.  For multiple word fields, use underscores: e.g., <Code>my_long_field_name</Code></List.Item>
                    <List.Item>Duplicate terms will not be added.  You must remove or rename existing terms that have the same name</List.Item>
                </List>
                <FileButton onChange={setFile} accept="text/csv">
                    {(props) => <Button {...props} leftIcon={<IconUpload />} mt={16}> Choose File</Button>}
                </FileButton>
                {file &&
                    <>
                        <Text>{file.name}</Text>
                        <Button color="green" mt={16} onClick={() => onClickHandler(file)}>Finish Importing</Button>
                    </>
                }
            </Flex>
        </>
    );
}