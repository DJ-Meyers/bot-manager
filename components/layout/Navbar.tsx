import { ActionIcon, Anchor, Button, Container, MantineTheme, ThemeIcon, useMantineTheme } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react"
import { IconHome, IconLogout, IconBrandReddit } from "@tabler/icons-react";
import styled from "@emotion/styled";

const StyledNav = styled.nav`
    padding: 8px 0;
    background-color: ${({ theme }: { theme: MantineTheme }) => theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1]}
`

export const Navbar = () => {
    const { data: session, status } = useSession();
    const theme = useMantineTheme();

    return (
        <StyledNav theme={theme}>
            <Container>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
                    <div style={{ display: "flex", gap: 8 }}>
                        <Anchor href="/">
                            <ActionIcon variant="transparent">
                                <IconHome size={20} />
                            </ActionIcon>
                        </Anchor>
                        {session?.user &&
                            <Anchor href="/" underline={false} variant="text">
                                My Bots
                            </Anchor>
                        }
                    </div>
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
                </div>
            </Container>
        </StyledNav>
    )
}