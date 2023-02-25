import { Button, TextInput } from "@mantine/core";
import { useState } from "react";

const FieldModal = ({ clickHandler, fields }: { clickHandler: (val:string) => void, fields: string[] }) => {
    const [newFieldName, setNewFieldName] = useState<string>("");
    
    return (
        <>
            <TextInput
                label="Field Name"
                placeholder="field_name"
                data-autofocus
                defaultValue={newFieldName}
                onChange={(e) => { setNewFieldName(e.target.value) }}
                error={fields.includes(newFieldName) ? "Duplicate Field" : null}
            />
            <Button
                type="submit"
                onClick={() => clickHandler(newFieldName)}
                fullWidth
            >Submit</Button>
        </>
    );
}

export default FieldModal;