import { ITerm } from "./Term";

export interface IGlossary {
    name: string;
    owners: string[];
    subreddits: string[];
    terms: ITerm[];
}