import { Button, Drawer, Group, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { ModalSettings } from "@mantine/modals/lib/context";
import { SetStateAction, useEffect, useState } from "react";
import { ITerm } from "../../../data/Term";
import FieldModal from "./FieldModal";

interface TermFormProps {
    isOpen: boolean,
    setIsOpen: (val: boolean) => void,
    fields: string[],
    modalArgs: ModalSettings,
    onSubmit: (value: ITerm) => void
}

const TermForm = ({ isOpen, setIsOpen, fields, modalArgs, onSubmit }: TermFormProps) => {
    const [formState, setFormState] = useState<ITerm>({ term: "", definition: "" });
    
    const termForm = useForm<ITerm>({
        initialValues: formState,
    });

    useEffect(() => {
        const newTerm: ITerm = { term: "", definition: ""};
        fields.forEach((field) => {
            newTerm[field] = "";
        });
        termForm.setValues(newTerm);
    }, [fields]);

    return (
        <Drawer
            opened={isOpen}
            onClose={() => setIsOpen(false)}
            title="Add New Term"
            padding="xl"
            size="xl"
        >
            <form>
                {fields.map((field) => field === "definition" ? (
                    <Textarea mb={8}
                        key={field}
                        label={field}
                        {...termForm.getInputProps(field)}
                    />
                ) : (
                    <TextInput
                        mb={8}
                        key={field}
                        label={field}
                        {...termForm.getInputProps(field)}
                    />
                ))}
                <Group position="right" mt={16} spacing={16}>
                    <Button variant="light" color="blue" onClick={() => openModal(modalArgs)}>Add Field</Button>
                    <Button variant="light" color="green" onClick={() => onSubmit(termForm.values)}>Submit</Button>
                </Group>
            </form>
        </Drawer>
    )
}

export default TermForm;