import { Text } from "@mantine/core";

interface childrenProps {
    children: string
}

const Label = ({ children }: childrenProps) => {
    return (
        <Text className="mantine-InputWrapper-label mantine-MultiSelect-label mantine-1hwfu2">
            {children}
        </Text>
    )
}

export default Label;