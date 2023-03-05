import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteTermByName, getGlossaryById, getGlossaryCollection, updateTermByIndex } from "../../../../../data/database";
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
        const glossary = await getGlossaryById(id as string, session.user.name);

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
    } else if (req.method === "PUT") {
        const payload: ITerm = await JSON.parse(req.body);
        const updateResult = await updateTermByIndex(id as string, parseInt(index as string), payload);

        if (updateResult.matchedCount === 1 && updateResult.matchedCount === updateResult.modifiedCount) {
            res.status(200).json({ message: `Succesfully updated term ${index}` });
            return;
        } else if (updateResult.matchedCount === 1 && updateResult.matchedCount !== updateResult.modifiedCount) {
            res.status(409).json({ message: `Request rejected because fields haven't changed.` });
            return;
        } else {
            res.status(404).json({ message: `Could not find term ${index} in glossary: ${id}.` });
            return;
        }
    } else if (req.method === "DELETE") {
        const payload = await JSON.parse(req.body);
        const updateResult = await deleteTermByName(id as string, payload.term, session.user.name);
        
        if (updateResult.matchedCount === 1 && updateResult.matchedCount === updateResult.modifiedCount) {
            res.status(200).json({ message: `Succesfully updated glossary ${id}` });
            return;
        } else if (updateResult.matchedCount === 1 && updateResult.matchedCount !== updateResult.modifiedCount) {
            res.status(409).json({ message: `Request rejected because fields haven't changed.` });
            return;
        } else {
            res.status(404).json({ message: `Could not find term ${index} in glossary: ${id}.` });
            return;
        }
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;