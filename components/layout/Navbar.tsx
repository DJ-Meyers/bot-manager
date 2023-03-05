import { ActionIcon, Anchor, Button, Container, Flex, Header } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react"
import { IconHome, IconLogout, IconBrandReddit } from "@tabler/icons-react";

export const Navbar = () => {
    const { data: session, status } = useSession();

    return (
        <Header height={{ base: 48, md: 64}} bg="dark" p="md">
            <Container>
                <Flex justify="space-between" align="center">
                    <Flex gap={16} align="flex-end">
                        <Anchor href="/">
                            <ActionIcon variant="transparent">
                                <IconHome size={20} />
                            </ActionIcon>
                        </Anchor>
                        {session?.user?.name &&
                            <Anchor href={`/user/${session.user.name}`} underline={false} variant="text">
                                Glossaries
                            </Anchor>
                        }
                    </Flex>
                    {status !== "loading" &&
                        session?.user ? (
                            <Button
                                size="xs"
                                variant="default"
                                onClick={(e) => { e.preventDefault(); signOut(); }}
                                leftIcon={<IconLogout />}
                            >
                                Sign Out
                            </Button>
                        ) : (
                            <Button
                                size="xs"
                                variant="default"
                                onClick={(e) => { e.preventDefault(); signIn("reddit", undefined, { 'state': 'some_string' }); }}
                                leftIcon={<IconBrandReddit />}
                            >
                                Sign In
                            </Button>
                        )
                        
                    }
                </Flex>
            </Container>
        </Header>
    )
}