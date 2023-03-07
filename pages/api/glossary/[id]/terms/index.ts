import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteAllTermsInGlossary, deleteFieldForAllTermsInGlossary, GlossaryApiResponse, handleUpdateResults, insertTermForGlossary, updateTermsForGlossary } from "../../../../../data/database";
import { authOptions } from "../../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    const username = session.user.name;
    if (req.method === "PUT") {
        const newTerms = JSON.parse(req.body);
        const updateResult = await updateTermsForGlossary(id as string, username, newTerms);

        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { ...newTerms },
                409: { message: "Request rejected because Terms haven't changed." },
                404: { message: `Could not find glossary owned by ${username} with id: ${id}.` }
            }
        )
    } else if (req.method === "PATCH") {
        const newTerm = JSON.parse(req.body);
        const updateResult = await insertTermForGlossary(id as string, username, newTerm);

        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { ...newTerm },
                409: { message: "Request rejected because Terms haven't changed." },
                404: { message: `Could not find glossary owned by ${username} with id: ${id}.` }
            }
        )
    } else if (req.method === "DELETE") {
        const updateResult = await deleteAllTermsInGlossary(id as string, username);
        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Successfully removed all terms in glossary ${id}` },
                409: { message: "No Terms to delete" },
                404: { message: `Could not find glossary owned by ${username} with id: ${id}.` }
            }
        )
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;