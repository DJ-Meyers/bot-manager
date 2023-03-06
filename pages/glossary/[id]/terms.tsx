import { ActionIcon, Anchor, Button, Group, Loader, Table, Title, Text, Flex, Autocomplete, TextInput } from "@mantine/core"
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconSearch, IconTrash, IconUpload } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FieldModal from "../../../components/glossaries/terms/FieldModal";
import TermForm from "../../../components/glossaries/terms/TermForm";
import UploadCsvModal from "../../../components/glossaries/terms/UploadCsvModal";
import { IGlossary } from "../../../data/Glossary";
import { ITerm } from "../../../data/Term";
import Papa from "papaparse";

const TermsPage = () => {    
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession({ required: true });
    const [glossary, setGlossary] = useState<IGlossary>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdatingFromCsv, setIsUpdatingFromCsv] = useState<boolean>(false);
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
        if (isUpdatingFromCsv) {
            saveTerms();
            setIsUpdatingFromCsv(false);
        }
    }, [terms,]);

     useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        getGlossary(id as string);
    }, [id]);

    async function getGlossary(id: string) {
        fetch(`/api/glossary/${id}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data);
            setTerms(data.terms);
        });
    }
   
    function addField(field: string) {
        setFields((curr) => [...curr, field]);
        closeAllModals();
    }

    const addFieldModalArgs = {
        title: "Add Field",
        children: <FieldModal fields={fields} clickHandler={addField} />
    }

    async function uploadCsv(file: File) {
        if (!file) return;
        const reader = new FileReader();

        reader.onload = async ({ target }: any) => {
            setIsUpdatingFromCsv(true);
            const csv = Papa.parse(target.result, { header: true, quoteChar: `"` });
            const parsedData = csv?.data as ITerm[];
            const failedImports: ITerm[] = [], successfulImports: ITerm[] = [];
            parsedData.forEach((newTerm) => {
                if (terms.map((oldTerm) => oldTerm.term).includes(newTerm.term)) {
                    failedImports.push(newTerm);
                } else {
                    successfulImports.push(newTerm);
                }
            });
            if (successfulImports.length) setTerms((curr) => [...curr, ...successfulImports]);
            showNotification({
                title: "Uploading Terms",
                message: `${successfulImports.length} new terms being uploaded.  ${failedImports.length} duplicate terms were ignored`,
                color: "grape",
            });
            setIsUpdatingFromCsv(false);
        }

        reader.readAsText(file);
        closeAllModals();
    }

    const uploadCsvModalArgs = {
        title: "Upload CSV",
        children: <UploadCsvModal onClickHandler={(file: File) => { uploadCsv(file).then(() => saveTerms()) }} />
    }

    if (!isLoading && status === "authenticated" && session?.user?.name && glossary && glossary.owners && !glossary.owners.includes(session.user.name)) {
        return <>You are not an owner of this Glossary</>
    }

    if (isLoading) return <Loader />

    function saveTerms() {
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
    
    function addTerm(term: ITerm) {
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

    function deleteTerm(term: ITerm, index: number) {
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

    function deleteField(fieldName: string) {
        fetch(`/api/glossary/${id}/terms`, {
            method: "DELETE",
            body: JSON.stringify({ fieldName })
        }).then(async (res) => {
            if (res.status !== 200) {
                const { message } = await res.json();
                throw new Error(message);
            }
            return await res.json()
        }).then((data) => {
            showNotification({
                title: "Success",
                message: `Removed field ${fieldName}`,
                color: "green"
            });
        }).then(async () => {
            await getGlossary(id as string);
        }).catch((err) => {
            showNotification({
                title: "There was an issue removing the field",
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
            <TermForm isOpen={isOpen} setIsOpen={setIsOpen} fields={fields} modalArgs={addFieldModalArgs} onSubmit={addTerm} />
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
                        variant="gradient"
                        gradient={{ from: "indigo", to: "cyan" }}
                        size="xs"
                        leftIcon={<IconPlus />}
                        onClick={() => setIsOpen(true)}
                    >
                        Term
                    </Button>
                    <Button
                        variant="gradient"
                        gradient={{ from: "teal", to: "green" }}
                        size="xs"
                        leftIcon={<IconUpload />}
                        onClick={() => openModal(uploadCsvModalArgs)}
                    >
                        Upload CSV
                    </Button>
                </Group>
            </Flex>
            <Table mt={16}>
                <thead>
                    <tr>
                        {fields.map((field) =>
                            <th key={field}><Flex align="center" gap={8}>
                                {field} {
                                    !["term", "definition"].includes(field) && 
                                        <ActionIcon
                                            color="red"
                                            variant="filled"
                                            size="xs"
                                            style={{ display: "inline" }}
                                            onClick={() => openConfirmModal({
                                                title: <Title order={3} color="red">DANGER: This action cannnot be undone</Title>,
                                                children: (
                                                    <Text>
                                                            Are you sure you want to delete field &quot;{field}&quot; from all Terms in this Glossary?
                                                        </Text>
                                                    ),
                                                    labels: { confirm: "Confirm", cancel: "Cancel" },
                                                    onCancel: () => { },
                                                    onConfirm: () => deleteField(field)
                                                }
                                            )}
                                        >
                                            <IconTrash size="xs" />
                                        </ActionIcon>
                                    }
                            </Flex></th>
                        )}
                        <th>Delete Term</th>
                    </tr>     
                </thead>
                <tbody>
                    {terms && terms.length > 0 && (searchValue ? terms.filter((t) => t.term.includes(searchValue)) : terms).map((term, i) => 
                        <tr key={i}>
                            {fields.map((field) => <td key={`${i}-${field}`}>{
                                field === "term" ? <Anchor href={`/glossary/${id}/terms/${i}`} >{term[field] || ""}</Anchor> : term[field] || ""
                            }</td>)}
                            <td>
                                <ActionIcon
                                    color="red"
                                    variant="filled"
                                    size="xs"
                                    onClick={() => openConfirmModal({
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