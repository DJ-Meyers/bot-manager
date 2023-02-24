import { MongoClient } from "mongodb";

export const getDbUrl = () => process.env.DATABASE_URL || "";

export const getMongoClient = async () => {
    const client = new MongoClient(getDbUrl());
    await client.connect();
    return client;
}

export const getGlossaryCollection = async () => {
    const client = await getMongoClient();
    const collection = client.db().collection('Glossary');

    return { client, collection };
}

export const closeConnection = (client: MongoClient) => {
    client.close();
}