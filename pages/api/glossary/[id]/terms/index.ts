import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteFieldForAllTermsInGlossary, getGlossaryCollection, GlossaryApiResponse, handleUpdateResults, insertTermForGlossary, updateTermsForGlossary } from "../../../../../data/database";
import { IGlossary } from "../../../../../data/Glossary";
import { ITerm } from "../../../../../data/Term";
import { authOptions } from "../../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    if (req.method === "PUT") {
        const newTerms = JSON.parse(req.body);
        const updateResult = await updateTermsForGlossary(id as string, session.user.name, newTerms);

        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { ...newTerms },
                409: { message: "Request rejected because Terms haven't changed." },
                404: { message: `Could not find glossary owned by ${session.user.name} with id: ${id}.` }
            }
        )
    } else if (req.method === "PATCH") {
        const newTerm = JSON.parse(req.body);
        const updateResult = await insertTermForGlossary(id as string, session.user.name, newTerm);

        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { ...newTerm },
                409: { message: "Request rejected because Terms haven't changed." },
                404: { message: `Could not find glossary owned by ${session.user.name} with id: ${id}.` }
            }
        )
    } else if (req.method === "DELETE") {
        const { fieldName } = JSON.parse(req.body);
        const updateResult = await deleteFieldForAllTermsInGlossary(id as string, session.user.name, fieldName);
        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Successfully removed field ${fieldName} from terms in glossary ${id}` },
                409: { message: "Request rejected because no fields were changed." },
                404: { message: `Could not find glossary owned by ${session.user.name} with id: ${id}.` }
            }
        )
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;