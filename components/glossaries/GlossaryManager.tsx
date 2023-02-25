import { Box, Button, Flex, Group, List, MultiSelect, Table, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form";
import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { IGlossary } from "../../data/Glossary"
import GlossarySummary from "./GlossarySummary";
import TermsTable from "./terms/TermsTable";

type GlossaryManagerProps = {
    glossaries: IGlossary[],
    session: Session | null
}

const GlossaryManager = ({ glossaries, session }: GlossaryManagerProps) => {
    const [selectedGlossary, setSelectedGlossary] = useState<IGlossary>();
    const [ownersList, setOwnersList] = useState<string[]>([]);
    const [subredditsList, setSubredditsList] = useState<string[]>([]);

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
        } else {
            form.setValues({
                owners: [],
                name: "",
                subreddits: [],
                terms: []
            });
            setOwnersList([]);
            setSubredditsList([]);
        }
    }, [selectedGlossary,]);
    
    return (
        <Flex>
            <Box style={{ flexBasis: "50%" }}>
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
                <GlossarySummary glossary={selectedGlossary} session={session} />
            }
        </Flex>
    )
}

export default GlossaryManager;