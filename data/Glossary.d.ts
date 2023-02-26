import { ObjectId } from "bson";
import { ITerm } from "./Term";

export type CommentOptions = {
    showDividers: boolean,
    showOwners: boolean,
    additionalMessage?: string,
}

export interface IGlossary {
    _id?: ObjectId;
    name: string;
    owners: string[];
    subreddits: string[];
    terms: ITerm[];
    commentOptions?: CommentOptions;
}