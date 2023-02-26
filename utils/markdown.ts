import { IGlossary } from "../data/Glossary";
import { ITerm } from "../data/Term";

export const getCommentFormat = (glossary: IGlossary) => {
    let extraFields: string[] = [];
    const terms = glossary.terms;

    for (let i = 0; i < terms.length; i++) {
        extraFields = [
            ...extraFields,
            ...Object.keys(terms[i]).filter((field) =>
                field !== "term" && field !== "definition" && !extraFields.includes(field)
            )
        ];
    }

    
    const output = [...terms.slice(0, 2).map((term) =>
`
**${term.term}:** ${term.definition}


    ${extraFields.map((field) => `${field}: ${term[field] || ""}`)}`)]

    if (glossary.commentOptions?.showOwners) {

        const ownersStr = glossary.owners.length > 1 ?
                "/u/" + glossary.owners.slice(0, -1).join(", /u/") + " or /u/" + glossary.owners.slice(-1)
            : 
                "/u/" + glossary.owners[0];
        output.push(`Contact ${ownersStr} if you have any concerns`);
    }

    if (glossary.commentOptions?.additionalMessage) {
        output.push(glossary.commentOptions.additionalMessage);
    }
    
    return output.join(glossary.commentOptions?.showDividers ? `

---

` : `


`);
}

export const interpolateVariables = (format: string, terms: ITerm[]) => {
}