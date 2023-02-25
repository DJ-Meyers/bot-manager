import { Button, Flex, Group, Table, Title } from "@mantine/core"
import { openModal, closeAllModals } from "@mantine/modals";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { ITerm } from "../../../data/Term"
import FieldModal from "./FieldModal";
import TermForm from "./TermForm";
import { IconDeviceFloppy, IconPencil, IconPlus } from "@tabler/icons-react";
import { IGlossary } from "../../../data/Glossary";
import { showNotification } from "@mantine/notifications";

export interface TermManagerProps {
    terms: ITerm[],
    setTerms: (value: SetStateAction<ITerm[]>) => void,
    glossary: IGlossary
}


const TermManager = ({ terms, setTerms, glossary }: TermManagerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fields, setFields] = useState<string[]>(["term", "definition"]);

    useEffect(() => {
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

    const addField = (field: string) => {
        setFields((curr) => [...curr, field]);
        closeAllModals();
    }

    const modalArgs = {
        title: "Add Field",
        children: <FieldModal fields={fields} clickHandler={addField} />
    }

    const saveTerms = () => {
        fetch(`/api/glossary/${glossary._id}`, {
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
            <TermForm isOpen={isOpen} setIsOpen={setIsOpen} fields={fields} modalArgs={modalArgs} setTerms={setTerms} />
            <Flex justify="space-between" align="center" >
                <Title order={3}>Terms</Title>
                <Group spacing={16}>
                    {/* <Button
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
                    >Field</Button> */}
                    <Button
                        variant="default"
                        size="xs"
                        leftIcon={<IconPencil />}
                        component="a"
                        href={`/glossary/${glossary._id}/terms`}
                    >Edit</Button>
                </Group>
            </Flex>  
            <Table mt={16}>
                <thead>
                    <tr>
                        {fields.map((field) => <th key={field}>{field}</th>)}
                    </tr>     
                </thead>
                <tbody>
                    {terms.map((term, i) => 
                        <tr key={i}>
                            {fields.map((field) => <td key={`${i}-${field}`}>{
                                term[field] || ""
                            }</td>)}
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    )
}

export default TermManager;