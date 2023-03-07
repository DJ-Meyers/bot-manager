import { IGlossary } from "../data/Glossary";
import { ITerm } from "../data/Term";
import { getExtraFields } from "../data/utils";

export function getCommentFormat(glossary: IGlossary) {
    const terms = glossary.terms.slice(0, 2);
    const extraFields = getExtraFields(glossary);
    const output = [...terms.map((term) =>
`
**${term.term}**

\`\`\`
  ${term.definition}

  ${extraFields.filter((field) => term[field]).map((field) => `${field}: ${term[field]}`).join(`
  `)}
\`\`\`
`
    )]

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