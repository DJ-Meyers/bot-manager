import { ObjectId } from "bson";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { closeConnection, getGlossaryCollection } from "../../../../data/database";
import { IGlossary } from "../../../../data/Glossary";
import { authOptions } from "../../auth/[...nextauth]";

type GlossaryApiResponse = {
    message: string
} | JSON | IGlossary

const handler = async (req: NextApiRequest, res: NextApiResponse<GlossaryApiResponse>) => {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;
    if (!session?.user?.name) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    if (req.method === "PATCH") {
        const { collection, client } = await getGlossaryCollection();
        const { owners, subreddits, name, commentOptions: { showDividers, showOwners, additionalMessage, recursiveDefinitions } } = JSON.parse(req.body);
        const mongoResult = await collection.updateOne({
            _id: new ObjectId(id as string), owners: session.user.name
        }, {
            $set: {
                owners: owners,
                subreddits: subreddits,
                name: name,
                commentOptions: {
                    showDividers: showDividers,
                    showOwners: showOwners,
                    recursiveDefinitions: recursiveDefinitions,
                    additionalMessage: additionalMessage
                }
            }
        });

        client.close();
        if (mongoResult.matchedCount === 1 && mongoResult.matchedCount === mongoResult.modifiedCount) {
            res.status(200).json({ message: `Succesfully updated glossary ${id}`});
            return;
        } else if (mongoResult.matchedCount === 1 && mongoResult.matchedCount !== mongoResult.modifiedCount) {
            res.status(409).json({ message: `Request rejected because fields haven't changed.` });
            return;
        } else {
            res.status(404).json({ message: `Could not find glossary owned by ${session.user.name} with id: ${id}.` });
            return;
        }
    } else if (req.method === "GET") {
        const { collection, client } = await getGlossaryCollection();
        const glossary = (await collection.findOne({ _id: new ObjectId(id as string), owners: session.user.name })) as IGlossary;
        client.close();
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