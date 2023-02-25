import { NextApiRequest, NextApiResponse } from "next";
import { closeConnection, getGlossaryCollection } from "../../../../data/database";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username } = req.query;
    const { client, collection } = await getGlossaryCollection();

    let data = await collection.find({ owners: username }).toArray();

    closeConnection(client);
    if (!data) {
        const res = await collection.insertOne({
            name: `${username}'s Glossary`,
            terms: [],
            owners: [username],
            subreddits: [],
        });
        data = await collection.find({ owners: username }).toArray();
    }
    res.status(200).json(data);
}

export default handler;