import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteFieldForAllTermsInGlossary, GlossaryApiResponse, handleUpdateResults } from "../../../../../../data/database";
import { authOptions } from "../../../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id, fieldName } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    const username = session.user.name;
    if (req.method === "DELETE") {
        const updateResult = await deleteFieldForAllTermsInGlossary(id as string, username, fieldName as string);
        return await handleUpdateResults(
            res,
            updateResult,
            {
                200: { message: `Successfully removed field ${fieldName} from terms in glossary ${id}` },
                409: { message: "Request rejected because no fields were changed." },
                404: { message: `Could not find glossary owned by ${username} with id: ${id}.` }
            }
        )
    } else {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    }
}

export default handler;