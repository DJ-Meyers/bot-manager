import { Container } from "@mantine/core"
import Head from "next/head"
import { ReactElement } from "react"
import AutoBreadcrumbs from "./AutoBreadcrumbs"
import { Navbar } from "./Navbar"

interface props {
    children: ReactElement,
}

export const Page = ({ children }: props) => {
    return (
        <>
            <Head>
                <title>Reddit Glossary Manager</title>
            </Head>
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