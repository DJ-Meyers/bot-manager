import { Anchor, Button, Flex, Group, Table, Title } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ITerm } from "../../../data/Term";

const TermsTable = ({ glossaryId, terms }: { glossaryId: string, terms: ITerm[] }) => {
    const [fields, setFields] = useState<string[]>(["term", "definition"]);

    useEffect(() => {
        if (!terms) return;
        const tempFields: string[] = ["term", "definition"];
        terms.forEach((t) => {
            Object.keys(t).forEach((field) => {
                if (!tempFields.includes(field)) {
                    tempFields.push(field);
                }
            });
        });
        setFields(tempFields);
    }, [terms,]);



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
                        href={`/glossary/${glossaryId}/terms`}
                    >Edit Terms</Button>
                </Group>
            </Flex> 
            <Table mt={16}>
                <thead>
                    <tr>
                        {fields.map((field) => <th key={field}>{field}</th>)}
                    </tr>     
                </thead>
                <tbody>
                    {terms && terms.map((term, i) => 
                        <tr key={i}>
                            {fields.map((field) => <td key={`${i}-${field}`}>{
                                field === "term" ? <Anchor href={`/glossary/${glossaryId}/term/${i}`} >{term[field] || ""}</Anchor> : term[field] || ""
                            }</td>)}
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    )
}

export default TermsTable;