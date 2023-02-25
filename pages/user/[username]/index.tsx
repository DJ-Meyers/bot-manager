import { Loader, Text, Title } from "@mantine/core";
import { useSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import GlossaryManager from "../../../components/glossaries/GlossaryManager";
import { IGlossary } from "../../../data/Glossary";

const UserPage = () => {
    const router = useRouter();
    const { username } = router.query;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossaries, setGlossaries] = useState<IGlossary[]>([]);
    const { data: session, status } = useSession({ required: true });

    useEffect(() => {
        if (status === "authenticated" && session?.user?.name !== username) return;
        setIsLoading(true);
        fetch(`/api/user/${username}/glossaries`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossaries(data);
        });
    }, [username,session?.user?.name,status]);
    
        
    if (status === "authenticated" && session?.user?.name !== username) {
        return (<><Title>Unauthorized</Title></>)
    }

    return (
        <>
            {isLoading ? (
                <Loader />
            ) :
                glossaries.length > 0 ? (
                    <GlossaryManager glossaries={glossaries} session={session} />
                ) : (
                    <Text>No Glossaries Found</Text>       
                )
            }
        </>
    );
}

UserPage.authenticationEnabled = true;

export default UserPage;