import { Anchor, Breadcrumbs, Text } from "@mantine/core";
import { useRouter } from "next/router";

interface CrumbProps {
    text: string,
    href: string,
    last: boolean
}

const Crumb = ({ text, href, last=false }: CrumbProps) => {
    if (last) {
        return <Text>{text}</Text>
    }

    return (<Anchor href={href}>{text}</Anchor>)
}

const AutoBreadcrumbs = () => {
    const router = useRouter();

    if (router.asPath === "/") return <></>

    function generateBreadcrumbs() {

        const asPathWithoutQuery = router.asPath.split("?")[0];
        const asPathNestedRoutes = asPathWithoutQuery.split("/").filter(v => v.length > 0);
        
        const crumbList = asPathNestedRoutes.map((subpath, idx) => {
            const href = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");
            const text = subpath;
            return { href, text };
        });

        return [
            <Crumb key="home" text="home" href="/" last={false} />,
            ...crumbList.map((crumb, i) =>
                <Crumb {...crumb} key={i} last={i === crumbList.length - 1} />
            )
        ]
    }

    const crumbs = generateBreadcrumbs();

    return (
        <Breadcrumbs>{crumbs}</Breadcrumbs>
    )
}

export default AutoBreadcrumbs;