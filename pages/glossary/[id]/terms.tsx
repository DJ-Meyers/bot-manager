import { Anchor, Button, Flex, Group, Loader, Table, Title } from "@mantine/core"
import { closeAllModals, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FieldModal from "../../../components/glossaries/terms/FieldModal";
import TermForm from "../../../components/glossaries/terms/TermForm";
import { IGlossary } from "../../../data/Glossary";
import { ITerm } from "../../../data/Term";

const TermsPage = () => {    
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession({ required: true });
    const [glossary, setGlossary] = useState<IGlossary>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
    const [fields, setFields] = useState<string[]>(["term", "definition"]);
    const [terms, setTerms] = useState<ITerm[]>([]);

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


    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        fetch(`/api/glossary/${id}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data);
            setTerms(data.terms);
        });
    }, [id]);


    const addField = (field: string) => {
        setFields((curr) => [...curr, field]);
        closeAllModals();
    }

    const modalArgs = {
        title: "Add Field",
        children: <FieldModal fields={fields} clickHandler={addField} />
    }

    if (!isLoading && status === "authenticated" && session?.user?.name && glossary && glossary.owners && !glossary.owners.includes(session.user.name)) {
        return <>You are not an owner of this Glossary</>
    }

    if (isLoading) return <Loader />

    const saveTerms = () => {
        fetch(`/api/glossary/${glossary!._id}`, {
            method: "PATCH",
            body: JSON.stringify(terms)
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return res.json()
        }).then((data) => {
            setTerms(data);
            showNotification({
                title: "Success",
                message: "Updated Terms",
                color: "green"
            })
        }).catch((err) => {
            showNotification({
                title: "There was an issue saving the terms",
                message: `${err}`,
                color: "red"
            })
        });
    }
        

    return (
        <>
            <Title order={2}>Modify Terms for {glossary?.name}</Title>
            <TermForm isOpen={isOpen} setIsOpen={setIsOpen} fields={fields} modalArgs={modalArgs} setTerms={setTerms} />
            <Group spacing={16} mt={16}>
                <Button
                    variant="default"
                    size="xs"
                    leftIcon={<IconDeviceFloppy />}
                    onClick={saveTerms}
                >Save</Button>
                <Button
                    variant="default"
                    size="xs"
                    leftIcon={<IconPlus />}
                    onClick={() => setIsOpen(true)}
                >Term</Button>
                <Button
                    variant="default"
                    size="xs"
                    leftIcon={<IconPlus />}
                    onClick={() => openModal(modalArgs)}
                >Field</Button>
            </Group>
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
                                field === "term" ? <Anchor href={`/glossary/${id}/term/${i}`} >{term[field] || ""}</Anchor> : term[field] || ""
                            }</td>)}
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    )
}

TermsPage.authenticationEnabled = true;

export default TermsPage