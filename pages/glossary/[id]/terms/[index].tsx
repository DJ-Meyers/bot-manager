import { Button, Group, Loader, Textarea, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { closeAllModals, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FieldModal from "../../../../components/glossaries/terms/FieldModal";
import { IGlossary } from "../../../../data/Glossary";
import { ITerm } from "../../../../data/Term";
import { getExtraFields } from "../../../../data/utils";

const TermPage = () => {
    const router = useRouter();
    const { id, index } = router.query;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<IGlossary>();
    const [fields, setFields] = useState<string[]>(["term", "definition"]);
    const [term, setTerm] = useState<ITerm>();

    useEffect(() => {
        if (!index || !id) return;
        setIsLoading(true);
        fetch(`/api/glossary/${id}/terms/${index}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data.glossary);
            setTerm(data.term);
        });
    }, [id, index]);

    useEffect(() => {
        if (!term) return;
        form.setValues(term);
    }, [term]);

    useEffect(() => {
        if (!glossary) return;
        setFields(["term", "definition", ...getExtraFields(glossary)]);
    }, [glossary])

    const form = useForm<ITerm>({
        initialValues: {
            term: "",
            definition: "",
        }
    });

    async function updateTerm(term: ITerm) {
        fetch(`/api/glossary/${glossary!._id}/terms/${index}`, {
            method: "PUT",
            body: JSON.stringify(term)
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return res.json()
        }).then((data) => {
            showNotification({
                title: "Success",
                message: "Updated Term",
                color: "green"
            })
        }).catch((err) => {
            showNotification({
                title: "There was an issue saving the term",
                message: `${err}`,
                color: "red"
            })
        });
    }

    if (isLoading || !term || !glossary) return <Loader />

    const extraFields = getExtraFields(glossary);

    function addField(field: string) {
        setFields((curr) => [...curr, field]);
        closeAllModals();
    }
    const modalArgs = {
        title: "Add Field",
        children: <FieldModal fields={["term", "definition", ...extraFields]} clickHandler={addField} />
    }
    
    return (
        <>
            <Title order={2}>Modify Term {index}</Title>
            <form onSubmit={form.onSubmit((values) => updateTerm(values))}>
                {fields.map((field) => field === "definition" ? (
                    <Textarea mb={8}
                        key={field}
                        label={field}
                        {...form.getInputProps(field)}
                    />
                ) : (
                    <TextInput
                        mb={8}
                        key={field}
                        label={field}
                        {...form.getInputProps(field)}
                    />
                ))}
                <Group position="right" mt={16} spacing={16}>
                    <Button variant="light" color="blue" onClick={() => openModal(modalArgs)}>Add Field</Button>
                    <Button variant="light" color="green" type="submit">Submit</Button>
                </Group>
            </form>
        </>
    )
}

TermPage.authenticationEnabled = true;

export default TermPage;