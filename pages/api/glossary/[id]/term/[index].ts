import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getGlossaryCollection } from "../../../../../data/database";
import { IGlossary } from "../../../../../data/Glossary";
import { ITerm } from "../../../../../data/Term";
import { authOptions } from "../../../auth/[...nextauth]";

type GlossaryTermApiResponse = {
    message: string
} | { glossary: IGlossary, term: ITerm }

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryTermApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id, index } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    if (req.method === "GET") {
        const { collection, client } = await getGlossaryCollection();
        const glossary = (await collection.findOne({ _id: new ObjectId(id as string), owners: session.user.name })) as IGlossary;
        client.close();
        if (!glossary) {
            res.status(404).json({ message: `Could not find glossary with id: ${id}` });
            return;
        }
        const term = glossary.terms[parseInt(index as string)];
        if (!term) {
            res.status(404).json({ message: `Could not find term with index: ${index} in ${glossary.name}` });
            return;
        }
        res.status(200).json({ glossary, term });
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;