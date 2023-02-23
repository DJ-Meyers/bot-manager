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
          <p>
            Welcome {session.user?.name}
          </p>
        ) : (
          <p>Sign in to get started</p>
        )
      }
    </Group>
  );
}
