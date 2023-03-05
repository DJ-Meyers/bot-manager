import { Box, Button, Divider, Flex, Group, Loader, MultiSelect, Text, TextInput, Title, Checkbox } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TermsTable from "../../../components/glossaries/terms/TermsTable";
import { IGlossary } from "../../../data/Glossary";
import ReactMarkdown from "react-markdown";
import { getCommentFormat } from "../../../utils/markdown";
import Label from "../../../components/text/label";

const GlossaryPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession({ required: true });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<IGlossary>();
    const [commentPreview, setCommentPreview] = useState<string>("");

    const form = useForm<IGlossary>({
        initialValues: {
            owners: [],
            name: "",
            subreddits: [],
            terms: [],
            commentOptions: {
                showOwners: true,
                showDividers: true,
                recursiveDefinitions: true,
                additionalMessage: "",
            }
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
        if (!form) return;
        setCommentPreview(getCommentFormat(form.values));
    }, [form.values])

    useEffect(() => {
        if (glossary) {
            form.setValues(glossary);
        } else {
            form.setValues({
                owners: [],
                name: "",
                subreddits: [],
                terms: [],
                commentOptions: {
                    showOwners: true,
                    recursiveDefinitions: true,
                    additionalMessage: "",
                    showDividers: true
                }
            });
        }
    }, [glossary,]);

    if (isLoading) return <Loader />

    if (!glossary) return <Title order={2}>Glossary not found</Title>


    const updateGlossary = (values: IGlossary) => {
        fetch(`/api/glossary/${glossary!._id}`, {
            method: "PATCH",
            body: JSON.stringify(values)
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return res.json()
        }).then((data) => {
            showNotification({
                title: "Success",
                message: data.message,
                color: "green"
            })
        }).catch((err) => {
            showNotification({
                title: "There was an issue updating the glossary",
                message: `${err}`,
                color: "red"
            })
        });
    }

    return (
        <>
            <Title order={2}>Modify {glossary.name}</Title>
            <form onSubmit={form.onSubmit((values) => updateGlossary(values))} style={{ marginTop: 16 }}>
                <TextInput
                    withAsterisk
                    label="Name"
                    placeholder={session?.user?.name ? `${session.user.name}'s Glossary` : "My Glossary"}
                    {...form.getInputProps("name")}
                />
                <MultiSelect
                    label="Owners"
                    data={glossary.owners}
                    description="Do not include '/u/' in owner names"
                    placeholder="Add Owners"
                    searchable
                    clearable
                    creatable
                    getCreateLabel={(query) => `Add ${query}`}
                    onCreate={(query) => {
                        glossary.owners.push(query);
                        return query;
                    }}
                    {...form.getInputProps("owners")}
                />
                <MultiSelect
                    label="Subreddits"
                    data={glossary.subreddits}
                    placeholder="Add Subreddits"
                    description="Do not include '/r/' in subreddit names"
                    searchable
                    clearable
                    creatable
                    getCreateLabel={(query) => `Add ${query}`}
                    onCreate={(query) => {
                        glossary.subreddits.push(query);
                        return query;
                    }}
                    {...form.getInputProps("subreddits")}
                />
                <Flex mt={16} gap={16}>
                    <Box sx={(theme) => ({
                        flexBasis: "50%"
                    })}>
                        <Label>Comment Options</Label>
                        <Checkbox mt={16} label="Show Owners" {...form.getInputProps("commentOptions.showOwners", {type: "checkbox"})} />
                        <Checkbox mt={16} label="Show Dividers" {...form.getInputProps("commentOptions.showDividers", {type: "checkbox"})} />
                        <Checkbox mt={16} label="Recursive Definitions" {...form.getInputProps("commentOptions.recursiveDefinitions", {type: "checkbox"})} />
                        <TextInput mt={16} label="Additional Message" {...form.getInputProps("commentOptions.additionalMessage")} />
                    </Box>
                    <div style={{ flexBasis: "50%", height: "100%" }}>
                        <Label>Preview</Label>
                        <Box sx={(theme) => ({
                            borderRadius: theme.radius.md,
                            backgroundColor: theme.colors.gray[9],
                            padding: 8,
                            marginTop: 16
                        })}>
                            <ReactMarkdown>
                                {commentPreview}
                            </ReactMarkdown>
                        </Box>
                    </div>
                </Flex>
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