import { NextApiRequest, NextApiResponse } from "next";
import { getGlossaryiesForUser } from "../../../../data/database";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username } = req.query;
    
    if (!username) {
        res.status(400).json({ message: `Username ${username} is not valid` });
        return;
    }
    
    const data = await getGlossaryiesForUser(username as string);
    res.status(200).json(data);
}

export default handler;