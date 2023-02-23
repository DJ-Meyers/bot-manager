import { Container } from "@mantine/core"
import { ReactElement } from "react"
import { Navbar } from "./Navbar"

interface props {
    children: ReactElement
}

export const Page = ({ children }: props) => {
    return (
        <>
            <Navbar />
            <Container>
                {children}
            </Container>
        </>
    )
}