import { ActionIcon, Anchor, Button, Container, Flex, MantineTheme, ThemeIcon, useMantineTheme } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react"
import { IconHome, IconLogout, IconBrandReddit } from "@tabler/icons-react";
import styled from "@emotion/styled";

const StyledNav = styled.nav`
    padding: 8px 0;
    margin-bottom: 16px;
    background-color: ${({ theme }: { theme: MantineTheme }) => theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1]}
`

export const Navbar = () => {
    const { data: session, status } = useSession();
    const theme = useMantineTheme();

    return (
        <StyledNav theme={theme}>
            <Container>
                <Flex justify="space-between" align="center">
                    <Flex gap="lg" align="flex-end">
                        <Anchor href="/">
                            <ActionIcon variant="transparent">
                                <IconHome size={20} />
                            </ActionIcon>
                        </Anchor>
                        {session?.user?.name &&
                            <Anchor href={`/user/${session.user.name}`} underline={false} variant="text">
                                Manage
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
        </StyledNav>
    )
}