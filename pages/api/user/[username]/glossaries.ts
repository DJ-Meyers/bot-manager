import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getGlossaryiesForUser } from "../../../../data/database";
import { authOptions } from "../../auth/[...nextauth]";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const { username } = req.query;
    if (!username) {
        res.status(400).json({ message: `Username ${username} is not valid` });
        return;
    } else if (username !== session?.user?.name) {
        res.status(403).json({ message: `Username ${username} did not match session user ${session?.user?.name}` });
    }
    
    const data = await getGlossaryiesForUser(username as string);
    res.status(200).json(data);
}

export default handler;