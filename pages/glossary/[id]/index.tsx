import { Button, Divider, Group, Loader, MultiSelect, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TermsTable from "../../../components/glossaries/terms/TermsTable";
import { IGlossary } from "../../../data/Glossary";

const GlossaryPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession({ required: true });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<IGlossary>();
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
        if (!id) return;
        setIsLoading(true);
        fetch(`/api/glossary/${id}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data);
        });
    }, [id]);

    useEffect(() => {
        if (glossary) {
            form.setValues(glossary);
            setOwnersList(glossary.owners);
            setSubredditsList(glossary.subreddits);
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
    }, [glossary,]);

    if (isLoading) return <Loader />

    if (!glossary) return <Title order={2}>Glossary not found</Title>


    const updateGlossary = () => {

    }

    return (
        <>
            <Title order={2}>Modify {glossary.name}</Title>
            <form onSubmit={form.onSubmit((values) => console.log(values))} style={{ marginTop: 16 }}>
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
                <Group position="right" my={16}>
                    <Button variant="gradient" type="submit">
                        Save Changes
                    </Button>
                </Group>
            </form>
            <Divider size="xs" />
            <TermsTable glossaryId={glossary._id!.toString()} terms={glossary.terms} />
        </>
    )
}

GlossaryPage.authenticationEnabled = true;

export default GlossaryPage;