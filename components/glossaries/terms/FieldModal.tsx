import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

const FieldModal = ({ clickHandler, fields }: { clickHandler: (val:string) => void, fields: string[] }) => {
    const form = useForm<{ field: string }>({
        initialValues: {
            field: ""
        },
        validate: {
            field: (value) => (fields.includes(value) ? "Duplicate field" : null)
        }
    });
    
    return (
        <form onSubmit={form.onSubmit((values) => clickHandler(values.field))}>
            <TextInput
                label="Field Name"
                placeholder="field_name"
                data-autofocus
                {...form.getInputProps("field")}
            />
            <Button
                type="submit"
                fullWidth
            >Submit</Button>
        </form>
    );
}

export default FieldModal;