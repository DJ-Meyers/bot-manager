import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteTermByName, getGlossaryById, getGlossaryCollection, GlossaryApiResponse, handleUpdateResults, updateTermByIndex } from "../../../../../data/database";
import { IGlossary } from "../../../../../data/Glossary";
import { ITerm } from "../../../../../data/Term";
import { authOptions } from "../../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
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
        return;
    } else if (req.method === "PUT") {
        const payload: ITerm = await JSON.parse(req.body);
        const updateResult = await updateTermByIndex(id as string, parseInt(index as string), payload);

        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Succesfully updated term ${index}` },
                409: { message: `Request rejected because fields haven't changed.` },
                404: { message: `Could not find term ${index} in glossary: ${id}.` }
            }
        );
    } else if (req.method === "DELETE") {
        const payload = await JSON.parse(req.body);
        const updateResult = await deleteTermByName(id as string, payload.term, session.user.name);
        
        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Succesfully updated glossary ${id}` },
                409: { message: `Request rejected because fields haven't changed.` },
                404: { message: `Could not find term ${index} in glossary: ${id}.` }
            }
        );
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;