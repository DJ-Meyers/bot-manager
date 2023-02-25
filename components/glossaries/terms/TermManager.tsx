import { Button, Flex, Group, Table, Title } from "@mantine/core"
import { SetStateAction, useEffect, useRef, useState } from "react";
import { ITerm } from "../../../data/Term"
import { IconPencil } from "@tabler/icons-react";
import { IGlossary } from "../../../data/Glossary";

export interface TermManagerProps {
    glossary: IGlossary
}


const TermManager = ({ glossary }: TermManagerProps) => {
    const [fields, setFields] = useState<string[]>(["term", "definition"]);

    useEffect(() => {
        if (!glossary) return;
        const tempFields: string[] = ["term", "definition"];
        glossary.terms.forEach((t) => {
            Object.keys(t).forEach((field) => {
                if (!tempFields.includes(field)) {
                    tempFields.push(field);
                }
            });
        });
        setFields(tempFields);
    }, [glossary,]);

    return (
        <>
            <Flex justify="space-between" align="center" mt={16}>
                <Title order={3}>Terms</Title>
                <Group spacing={16}>
                    <Button
                        variant="default"
                        size="xs"
                        leftIcon={<IconPencil />}
                        component="a"
                        href={`/glossary/${glossary._id}/terms`}
                    >Edit</Button>
                </Group>
            </Flex>  
            <Table mt={16}>
                <thead>
                    <tr>
                        {fields.map((field) => <th key={field}>{field}</th>)}
                    </tr>     
                </thead>
                <tbody>
                    {glossary.terms.map((term, i) => 
                        <tr key={i}>
                            {fields.map((field) => <td key={`${i}-${field}`}>{
                                term[field] || ""
                            }</td>)}
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    )
}

export default TermManager;