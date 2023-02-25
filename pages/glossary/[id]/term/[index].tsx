import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IGlossary } from "../../../../data/Glossary";
import { ITerm } from "../../../../data/Term";

const TermPage = () => {
    const router = useRouter();
    const { id, index } = router.query;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<IGlossary>();
    const [term, setTerm] = useState<ITerm>();

    useEffect(() => {
        if (!index) return;
        setIsLoading(true);
        fetch(`/api/glossary/${id}/term/${index}`).then((res) =>
            res.json()
        ).then((data) => {
            setIsLoading(false);
            setGlossary(data.glossary);
            setTerm(data.term);
        });
    }, [id]);

    return (
        <>Term: {JSON.stringify(term)}</>
    )
}

TermPage.authenticationEnabled = true;

export default TermPage;