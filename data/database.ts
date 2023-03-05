import { MongoClient, ObjectId, UpdateResult } from "mongodb";
import { NextApiResponse } from "next";
import { IGlossary } from "./Glossary";
import { ITerm } from "./Term";


export type GlossaryApiResponse = {
    message: string
} | JSON | { glossary: IGlossary, term: ITerm } | IGlossary

export const getDbUrl = () => process.env.DATABASE_URL || "";

export async function getMongoClient() {
    const client = new MongoClient(getDbUrl());
    await client.connect();
    return client;
}

/**
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function deleteTermByName(id: string, username: string, name: string): Promise<UpdateResult> {
    const { collection, client } = await getGlossaryCollection();
    const updateResult = await collection.updateOne({
        _id: new ObjectId(id), owners: username
    }, {
        $pull: { terms: { term: name } }
    });
    client.close();

    return updateResult;
}

export async function deleteFieldForAllTermsInGlossary(id: string, username: string, fieldName: string): Promise<UpdateResult> {
    const { collection, client } = await getGlossaryCollection();
    const nestedFieldName = ["terms", "$[]", fieldName].join(".");
    const unsetObj: { [s: string]: string } = {};
    unsetObj[nestedFieldName] = "";

    const updateResult = await collection.updateOne({
        _id: new ObjectId(id), owners: username
    }, {
        $unset: unsetObj
    });
    client.close();

    return updateResult;
}

/**
 * @returns {Promise<IGlossary>} Promise that returns the first glossary with the given id that has the given
 * username in its owners array.
 */
export async function getGlossaryById(id: string, username: string): Promise<IGlossary> {
    const { collection, client } = await getGlossaryCollection();
    const glossary = (await collection.findOne({ _id: new ObjectId(id), owners: username })) as IGlossary;
    client.close();
    return glossary;
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
 * Append an `ITerm` to the the `terms` field of a Glossary in the database
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function insertTermForGlossary(id: string, username: string, term: ITerm) {
    const { collection, client } = await getGlossaryCollection();
    const updateResult = await collection.updateOne({
        _id: new ObjectId(id), owners: username
    }, {
        $push: {
            terms: term
        }
    });
    client.close();

    return updateResult;
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
        "_id": new ObjectId(id),
    }, {
        $set: newTerm
    });

    client.close();
    return updateResult;
}

/**
 * Overwrite the fields of a Glossary in the database
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function updateGlossaryById(id: string, username: string, glossary: IGlossary) {
    if (!glossary || !glossary.commentOptions) return Promise.reject();

    const { collection, client } = await getGlossaryCollection();
    const updateResult = await collection.updateOne({
        _id: new ObjectId(id), owners: username
    }, {
        $set: {
            owners: glossary.owners,
            subreddits: glossary.subreddits,
            name: glossary.name,
            commentOptions: {
                showDividers: glossary.commentOptions.showDividers,
                showOwners: glossary.commentOptions.showOwners,
                recursiveDefinitions: glossary.commentOptions.recursiveDefinitions,
                additionalMessage: glossary.commentOptions.additionalMessage
            }
        }
    });
    client.close();

    return updateResult;
}

/**
 * Overwrite the `terms` field of a Glossary in the database
 * @returns {Promise<UpdateResult>} Promise that returns the UpdateResult which contains data about the update
 * operation
 */
export async function updateTermsForGlossary(id: string, username: string, terms: ITerm[]): Promise<UpdateResult> {
    const { collection, client } = await getGlossaryCollection();
    const updateResult = await collection.updateOne({
        _id: new ObjectId(id as string), owners: username
    }, {
        $set: {
            terms: terms
        }
    });

    client.close();

    return updateResult;
}


/**
 * Handle the logic for responding to different response codes.  Takes in an array of objects that have a response code
 * and a message or json object
 * @returns {void}
 */
export async function handleUpdateResults(
    res: NextApiResponse<GlossaryApiResponse>,
    updateResult: UpdateResult,
    responses: { [n: number]: GlossaryApiResponse }
): Promise<void> {
    if (updateResult.matchedCount === 1 && updateResult.matchedCount === updateResult.modifiedCount) {
        res.status(200).json(responses[200]);
        return;
    } else if (updateResult.matchedCount === 1 && updateResult.matchedCount !== updateResult.modifiedCount) {
        res.status(409).json(responses[409]);
        return;
    } else {
        res.status(404).json(responses[404]);
        return;
    }
}