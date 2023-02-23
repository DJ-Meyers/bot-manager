import { Anchor, Button, Container } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react"

export const Navbar = () => {
    const { data: session, status } = useSession();

    return (
        <nav>
            <Container>
                <Anchor href="/">
                    Home
                </Anchor>
                {session?.user &&
                    <Anchor href="/">
                        My Bots
                    </Anchor>
                }
                {status !== "loading" &&
                    session?.user ? (
                        <Button size="xs" variant="light" onClick={(e) => { e.preventDefault(); signOut(); }}>
                            Sign Out
                        </Button>
                    ) : (
                        <Button onClick={(e) => { e.preventDefault(); signIn("reddit", undefined, { 'state': 'some_string' }); }} size="xs" variant="light">
                            Sign In
                        </Button>
                    )
                    
                }
            </Container>
        </nav>
    )
}