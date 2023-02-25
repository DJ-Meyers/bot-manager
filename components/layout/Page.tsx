import { Container } from "@mantine/core"
import { ReactElement } from "react"
import AutoBreadcrumbs from "./AutoBreadcrumbs"
import { Navbar } from "./Navbar"

interface props {
    children: ReactElement,
    breadcrumbs: ReactElement[]
}

export const Page = ({ children, breadcrumbs }: props) => {
    return (
        <>
            <Navbar />
            <Container mt={16}>
                <AutoBreadcrumbs />
            </Container>
            <Container mt={16}>
                {children}
            </Container>
        </>
    )
}