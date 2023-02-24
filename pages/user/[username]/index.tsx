import { List, Loader } from "@mantine/core";
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
    const { data: session, status } = useSession();

    if (status !== "loading" && session?.user?.name !== username) {
        console.log("invalid:", session?.user?.name, username);
    }

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/glossary/${username}`).then((res) =>
            res.json()
        ).then((data) => {
            console.log(data);
            setGlossaries(data);
            setIsLoading(false);
        });
    }, [username]);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) :
                glossaries.length ? (
                    <GlossaryManager glossaries={glossaries} session={session} />
                ) : (
                    <p>No Glossaries Found</p>       
                )
            }
        </>
    );
}

export default UserPage;