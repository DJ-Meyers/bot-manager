import { Button, Group, Loader, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IGlossary } from "../../../../data/Glossary";
import { ITerm } from "../../../../data/Term";
import { getExtraFields } from "../../../../data/utils";

const TermPage = () => {
    const router = useRouter();
    const { id, index } = router.query;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<IGlossary>();
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

    const form = useForm<ITerm>({
        initialValues: {
            term: "",
            definition: "",
        }
    });

    if (isLoading || !term || !glossary) return <Loader />

    const extraFields = getExtraFields(glossary);
    
    return (
        <>
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
                <TextInput
                    mb={8}
                    label="Term"
                    {...form.getInputProps("term")}
                />
                <Textarea
                    mb={8}
                    label="Definition"
                    {...form.getInputProps("definition")}
                />
                {extraFields.map((field) => 
                    <TextInput
                        mb={8}
                        key={field}
                        label={field}
                        {...form.getInputProps(field)}
                    />
                )}
                <Group position="right" mt={16} spacing={16}>
                    <Button variant="light" color="green" type="submit">Submit</Button>
                </Group>
            </form>
        </>
    )
}

TermPage.authenticationEnabled = true;

export default TermPage;