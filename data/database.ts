import { MongoClient, ObjectId, UpdateResult } from "mongodb";
import { IGlossary } from "./Glossary";
import { ITerm } from "./Term";

export const getDbUrl = () => process.env.DATABASE_URL || "";

export async function getMongoClient() {
    const client = new MongoClient(getDbUrl());
    await client.connect();
    return client;
}

/**
 * Get the client and collection objects for the Glossary collection
 */
export async function getGlossaryCollection() {
    const client = await getMongoClient();
    const collection = client.db().collection('Glossary');

    return { client, collection };
}

/**
 * Fetches all glossaries that have the username in their owners array.  If no such arrays exist, 
 * create a default Glossary for the user 
 * @returns {IGlossary[]}
 */
export async function getGlossaryiesForUser(username: string): Promise<IGlossary[]> {
    const { client, collection } = await getGlossaryCollection();
    let data = await collection.find({ owners: username }).toArray();
    
    if (!data) {
        const res = await collection.insertOne({
            name: `${username}'s Glossary`,
            terms: [],
            owners: [username],
            subreddits: [],
        });
        data = await collection.find({ owners: username }).toArray();
    }

    client.close();
    return data as IGlossary[];
}

/**
 * @returns {Promise<IGlossary>} Promise that returns the first glossary with the given id that has the given
 * username in its owners array.
 */
export async function getGlossaryById(id: string, username: string): Promise<IGlossary> {
    const { collection, client } = await getGlossaryCollection();
    const glossary = (await collection.findOne({ _id: new ObjectId(id as string), owners: username })) as IGlossary;
    client.close();
    return glossary;
}

/**
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function updateTermByIndex(id: string, index: number, payload: ITerm): Promise<UpdateResult> {
    const { collection, client } = await getGlossaryCollection();
    const newTerm: any = {};
    for (const [k, v] of Object.entries(payload)) {
        const newFieldName = ["terms", index, k].join('.');
        newTerm[newFieldName] = v;
    }

    const updateResult = await collection.updateOne({
        "_id": new ObjectId(id as string),
    }, {
        $set: newTerm
    });

    client.close();
    return updateResult;
}

/**
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function deleteTermByName(id: string, name: string, username: string): Promise<UpdateResult> {
    const { collection, client } = await getGlossaryCollection();
    const updateResult = await collection.updateOne({
        _id: new ObjectId(id as string), owners: username
    }, {
        $pull: { terms: { term: name } }
    });
    client.close();

    return updateResult;
}