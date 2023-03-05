import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getGlossaryById, getGlossaryCollection, GlossaryApiResponse, handleUpdateResults, updateGlossaryById } from "../../../../data/database";
import { IGlossary } from "../../../../data/Glossary";
import { authOptions } from "../../auth/[...nextauth]";


const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    const username = session.user.name;

    if (req.method === "PATCH") {        
        const newValues = JSON.parse(req.body);
        const updateResult = await updateGlossaryById(id as string, username, newValues);

        return handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Succesfully updated glossary ${id}` },
                409: { message: `Request rejected because fields haven't changed.` },
                404: { message: `Could not find glossary owned by ${username} with id: ${id}.` }
            }
        )
    } else if (req.method === "GET") {
        const glossary = await getGlossaryById(id as string, username);
        if (!glossary) {
            res.status(404).json({ message: `Could not find glossary with id: ${id}` });
            return;
        }
        res.status(200).json(glossary);
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;