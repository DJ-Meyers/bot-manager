import { Button, Group } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function IndexPage() {
  const { data: session, status } = useSession();
  return (
    <Group mt={50} position="center">
      {status === "loading" ? (
        <p>Loading User Session...</p>
      ) :
        session?.user ? (
          <>
            Welcome {session.user?.name}
            <Link href="#">
              <Button onClick={(e) => { e.preventDefault(); signOut(); }} size="xl">Sign out</Button>
            </Link >
          </>
        ) : (
          <Link href="#">
            <Button onClick={(e) => { e.preventDefault(); signIn("reddit", undefined, { 'state': 'some_string' }); }} size="xl">Sign in with Reddit</Button>
          </Link >
        )
      }
    </Group>
  );
}
