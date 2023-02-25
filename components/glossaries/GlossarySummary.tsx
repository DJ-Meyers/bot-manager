import { Box, Button, Flex, Group, List, MultiSelect, Table, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form";
import { IconPencil } from "@tabler/icons-react";
import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { IGlossary } from "../../data/Glossary"
import TermsTable from "./terms/TermsTable";

type GlossarySummaryProps = {
    glossary: IGlossary,
    session: Session | null
}

const GlossarySummary = ({ glossary, session }: GlossarySummaryProps) => {

    if (!glossary) return <Title order={2}>No Glossary to Display</Title>
    
    return (
        <Box style={{ flexGrow: 1 }}>
            <Title order={2}>{glossary.name}</Title>
            <Flex justify="space-between" align="center" mt={16}>
                <Title order={3}>Preview</Title>
                <Group spacing={16}>
                    <Button
                        variant="default"
                        size="xs"
                        leftIcon={<IconPencil />}
                        component="a"
                        href={`/glossary/${glossary._id!.toString()}/`}
                    >Edit</Button>
                </Group>
            </Flex> 
            <TextInput
                label="Name"
                readOnly
                disabled
                defaultValue={glossary.name}
            />
            <MultiSelect
                label="Owners"
                readOnly
                disabled
                defaultValue={glossary.owners}
                data={glossary.owners}
            />
            <MultiSelect
                label="Subreddits"
                readOnly
                disabled
                defaultValue={glossary.subreddits}
                data={glossary.subreddits}
            />
            <TermsTable glossaryId={glossary._id!.toString()} terms={glossary.terms} />
        </Box>
    )
}

export default GlossarySummary;