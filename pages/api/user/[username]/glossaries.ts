import { NextApiRequest, NextApiResponse } from "next";
import { getGlossaryiesForUser } from "../../../../data/database";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { usernameParam } = req.query;
    const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;
    
    if (!username) {
        res.status(400).json({ message: `Username ${username} is not valid` });
        return;
    }
    
    const data = await getGlossaryiesForUser(username);
    res.status(200).json(data);
}

export default handler;