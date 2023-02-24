import { Box, Flex, List, MultiSelect, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form";
import { Session, User } from "next-auth";
import { useEffect, useState } from "react"
import { IGlossary } from "../../data/Glossary"

type GlossaryManagerProps = {
    glossaries: IGlossary[],
    session: Session | null
}

const GlossaryManager = ({ glossaries, session }: GlossaryManagerProps) => {
    const [selectedGlossary, setSelectedGlossary] = useState<IGlossary>();

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
        } else {
            form.setValues({
                owners: [],
                name: "",
                subreddits: [],
                terms: []
            })
        }
    }, [selectedGlossary])
    
    return (
        <Flex>
            <Box style={{ flexBasis: "50%", flexGrow: 1 }}>
                <header>
                    <h2>{session?.user?.name}&apos;s Glossaries</h2>
                </header>
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
                    <header>
                        <h2>Modify {selectedGlossary.name}</h2>
                    </header>
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>
                        <TextInput
                            withAsterisk
                            label="Name"
                            placeholder={session?.user?.name ? `${session.user.name}'s Glossary` : "My Glossary"}
                            {...form.getInputProps("name")}
                        />
                        <MultiSelect
                            label="Owners"
                            data={selectedGlossary.owners}
                            placeholder="Add Owners"
                            searchable
                            clearable
                            creatable
                            getCreateLabel={(query) => `Add ${query}`}
                            onCreate={(query) => {
                                form.setFieldValue("owners", [...selectedGlossary.owners, query])
                                return query;
                            }}
                            {...form.getInputProps("owners")}
                        />
                        <TextInput
                            withAsterisk
                            label="Subreddits"
                            placeholder="My Subreddit"
                            {...form.getInputProps("subreddits")}
                        />
                    </form>
                </Box>
            }
        </Flex>
    )
}

export default GlossaryManager;