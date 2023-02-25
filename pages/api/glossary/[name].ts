import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { closeConnection, getGlossaryCollection } from "../../../data/database";
import { authOptions } from "../auth/[...nextauth]";

type GlossaryApiResponse = {
    message: string
} | JSON

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { name } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    if (req.method !== "PATCH") {
        res.status(405).json({ message: "Invalid HTTP Method" });
        return;
    } else {
        const { collection, client } = await getGlossaryCollection();
        const newTerms = JSON.parse(req.body);
        const mongoResult = await collection.updateOne({
            name: name, owners: session.user.name
        }, {
            $set: {
                terms: newTerms
            }
        });

        if (mongoResult.matchedCount === 1 && mongoResult.matchedCount === mongoResult.modifiedCount) {
            res.status(200).json(newTerms);
            return;
        } else if (mongoResult.matchedCount === 1 && mongoResult.matchedCount !== mongoResult.modifiedCount) {
            res.status(409).json({ message: `Request rejected because Terms haven't changed.` });
            return;
        } else {
            res.status(404).json({ message: `Could not find glossary owned by ${session.user.name} with name ${name}.` });
            return;
        }
        
    }
}

export default handler;