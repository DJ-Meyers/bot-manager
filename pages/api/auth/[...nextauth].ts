import NextAuth from "next-auth";
import RedditProvider from "next-auth/providers/reddit"


const redditClientId = process.env.REDDIT_CLIENT_ID;
const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXT_AUTH_SECRET;

console.log(redditClientId, redditClientSecret, nextAuthSecret)
 
export const authOptions = {
    providers: [
        RedditProvider({
            clientId: redditClientId,
            clientSecret: redditClientSecret,
        }),
    ],
    secret: nextAuthSecret
};

export default NextAuth(authOptions)
