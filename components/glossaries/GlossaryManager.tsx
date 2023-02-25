import { Box, Button, Flex, Group, List, MultiSelect, Table, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form";
import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { IGlossary } from "../../data/Glossary"
import { ITerm } from "../../data/Term";
import TermManager from "./TermManager";

type GlossaryManagerProps = {
    glossaries: IGlossary[],
    session: Session | null
}

const GlossaryManager = ({ glossaries, session }: GlossaryManagerProps) => {
    const [selectedGlossary, setSelectedGlossary] = useState<IGlossary>();
    const [ownersList, setOwnersList] = useState<string[]>([]);
    const [subredditsList, setSubredditsList] = useState<string[]>([]);
    const [terms, setTerms] = useState<ITerm[]>([]);

    const form = useForm<IGlossary>({
        initialValues: {
            owners: [],
            name: "",
            subreddits: [],
            terms: []
        }
    });

    useEffect(() => {
        if (selectedGlossary) {
            form.setValues(selectedGlossary);
            setOwnersList(selectedGlossary.owners);
            setSubredditsList(selectedGlossary.subreddits);
            setTerms(selectedGlossary.terms);
        } else {
            form.setValues({
                owners: [],
                name: "",
                subreddits: [],
                terms: []
            });
            setOwnersList([]);
            setSubredditsList([]);
            setTerms([]);
        }
    }, [selectedGlossary,]);
    
    return (
        <Flex mt={16}>
            <Box style={{ flexBasis: "50%", flexGrow: 1 }}>
                <Title order={2}>{session?.user?.name}&apos;s Glossaries</Title>
                <List>
                    {glossaries.map((g) =>
                        <List.Item
                        style={{ cursor: "pointer", fontWeight: g === selectedGlossary ? 600 : 400 }}
                        onClick={() => selectedGlossary !== g ? setSelectedGlossary(g) : setSelectedGlossary(undefined)}
                        key={g.name}
                        >
                            {g.name} ({g.terms.length} terms)
                        </List.Item>
                    )}
                </List>
            </Box>
            {selectedGlossary &&
                <Box style={{ flexBasis: "50%" }}>
                    <Title order={2}>Modify {selectedGlossary.name}</Title>
                    <Title order={3}>Glossary Metadata</Title>
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>
                        <TextInput
                            withAsterisk
                            label="Name"
                            placeholder={session?.user?.name ? `${session.user.name}'s Glossary` : "My Glossary"}
                            {...form.getInputProps("name")}
                        />
                        <MultiSelect
                            label="Owners"
                            data={ownersList}
                            placeholder="Add Owners"
                            searchable
                            clearable
                            creatable
                            getCreateLabel={(query) => `Add ${query}`}
                            onCreate={(query) => {
                                setOwnersList((current) => [...current, query]);
                                return query;
                            }}
                            {...form.getInputProps("owners")}
                        />
                        <MultiSelect
                            label="Subreddits"
                            data={subredditsList}
                            placeholder="Add Subreddits"
                            searchable
                            clearable
                            creatable
                            getCreateLabel={(query) => `Add ${query}`}
                            onCreate={(query) => {
                                setSubredditsList((current) => [...current, query]);
                                return query;
                            }}
                            {...form.getInputProps("subreddits")}
                        />
                        <TermManager terms={terms} setTerms={setTerms} glossary={selectedGlossary} />
                    </form>
                </Box>
            }
        </Flex>
    )
}

export default GlossaryManager;