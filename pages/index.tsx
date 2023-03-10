import { Group, Text } from "@mantine/core";
import { useSession } from "next-auth/react";

export default function IndexPage() {
  const { data: session, status } = useSession();
  return (
    <Group mt={50} position="center">
      {status === "loading" ? (
        <Text>Loading User Session...</Text>
      ) :
        session?.user ? (
          <Text>
            Welcome {session.user?.name}
          </Text>
        ) : (
          <Text>Sign in to get started</Text>
        )
      }
    </Group>
  );
}
