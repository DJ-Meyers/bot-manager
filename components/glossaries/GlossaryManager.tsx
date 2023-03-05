import { Box, Flex, List, Title } from "@mantine/core"
import { useForm } from "@mantine/form";
import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { IGlossary } from "../../data/Glossary"
import GlossarySummary from "./GlossarySummary";

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
        if (!selectedGlossary) {
            setSelectedGlossary(glossaries[0]);
        }
    }, [glossaries]);

    useEffect(() => {
        if (selectedGlossary) {
            form.setValues(selectedGlossary);
        } else {
            form.setValues({
                owners: [],
                name: "",
                subreddits: [],
                terms: []
            });
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