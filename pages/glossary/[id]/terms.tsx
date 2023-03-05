import { ActionIcon, Anchor, Button, Group, Loader, Table, Title, Text, Flex, Autocomplete } from "@mantine/core"
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconDeviceFloppy, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
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
    const [searchValue, setSearchValue] = useState<string>();

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

    const getGlossary = async (id: string) => {
        fetch(`/api/glossary/${id}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data);
            setTerms(data.terms);
        });
    }

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        getGlossary(id as string);
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
        if (!glossary) return;
        fetch(`/api/glossary/${glossary!._id}/terms`, {
            method: "PUT",
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

    const addTerm = (term: ITerm) => {
        if (!glossary) return;
        fetch(`/api/glossary/${glossary!._id}/terms`, {
            method: "PATCH",
            body: JSON.stringify(term)
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return res.json()
        }).then((data) => {
            setIsOpen(false);
            setTerms((curr) => [...curr, data]);
            showNotification({
                title: "Success",
                message: `Added ${term.term}`,
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

    const deleteTerm = (term: ITerm, index: number) => {
        fetch(`/api/glossary/${id}/terms/${index}`, {
            method: "DELETE",
            body: JSON.stringify(term)
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return await res.json()
        }).then((data) => {
            showNotification({
                title: "Success",
                message: `Removed term ${term.term}`,
                color: "green"
            });
        }).then(async () => {
            await getGlossary(id as string);
        }).catch((err) => {
            showNotification({
                title: "There was an issue removing the term",
                message: `${err}`,
                color: "red"
            })
        });
    }

    if (!glossary) {
        return (
            <>
                <Title order={2}>Could not find glossary {id}</Title>
            </>
        )
    }

    return (
        <>
            <Title order={2}>Modify Terms for {glossary.name}</Title>
            <TermForm isOpen={isOpen} setIsOpen={setIsOpen} fields={fields} modalArgs={modalArgs} onSubmit={addTerm} />
            <Flex justify="space-between" align="center" mt={16} gap={16}>
                <Autocomplete
                    icon={<IconSearch />}
                    data={glossary.terms.map((t) => t.term)}
                    value={searchValue}
                    onChange={setSearchValue}
                    style={{ flexGrow: 1 }}
                />
                <Group position="right" spacing={16}>
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
            </Flex>
            <Table mt={16}>
                <thead>
                    <tr>
                        {fields.map((field) => <th key={field}>{field}</th>)}
                        <th>Delete</th>
                    </tr>     
                </thead>
                <tbody>
                    {terms && (searchValue ? terms.filter((t) => t.term.includes(searchValue)) : terms).map((term, i) => 
                        <tr key={i}>
                            {fields.map((field) => <td key={`${i}-${field}`}>{
                                field === "term" ? <Anchor href={`/glossary/${id}/terms/${i}`} >{term[field] || ""}</Anchor> : term[field] || ""
                            }</td>)}
                            <td>
                                <ActionIcon size={16} onClick={() => openConfirmModal({
                                    title: `Delete Term`,
                                    children: (
                                        <Text>
                                            Are you sure you want to delete term &quot;{term.term}&quot;
                                        </Text>
                                    ),
                                    labels: { confirm: "Confirm", cancel: "Cancel" },
                                    onCancel: () => { },
                                    onConfirm: () => deleteTerm(term, i)
                                })} >
                                    <IconTrash />
                                </ActionIcon>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    )
}

TermsPage.authenticationEnabled = true;

export default TermsPage