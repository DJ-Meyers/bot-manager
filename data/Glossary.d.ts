import { ObjectId } from "bson";
import { ITerm } from "./Term";

export interface IGlossary {
    _id?: ObjectId;
    name: string;
    owners: string[];
    subreddits: string[];
    terms: ITerm[];
}