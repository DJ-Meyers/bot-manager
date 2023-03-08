import { IGlossary } from "../data/Glossary";
import { ITerm } from "../data/Term";
import { getExtraFields } from "../data/utils";

export function getCommentFormat(glossary: IGlossary) {
    const extraFields = getExtraFields(glossary);
    let foundTerms = glossary.terms.slice(0, 2);

    function getNestedTerms(definition: string, set: Set<ITerm>): ITerm[] {
        const re = new RegExp(/\[\[([^\[\]]+)\]\]/g);
        const escapedText = definition.replace(/[()]/g, '\\$&')
        const matches = re.exec(escapedText);
        return glossary.terms.filter((term) => matches?.includes(term.term));
    }

    function getRecursiveDefinitions(terms: ITerm[], set: Set<ITerm>) {
        if (!terms || !terms.filter((term) => !set.has(term)).length) return;

        terms.forEach((term) => { 
            const nestedTerms = getNestedTerms(term.definition, set);
            nestedTerms.forEach((nt) => set.add(nt));
            getRecursiveDefinitions(nestedTerms, set);
        })
            
        return;
    }

    function getTermsString(terms: ITerm[]) {
        return terms.map((term) => `
### ${term.term}

  ${term.definition.replaceAll("[[", "`").replaceAll("]]", "`")}

  ${extraFields.filter((field) => term[field]).map((field) => `**${field}**: ${term[field]}`).join(
`  
`
        )}

`
        ).join(
`


`   );
    }

    const nestedTerms: ITerm[] = [];
    if (glossary.commentOptions?.recursiveDefinitions) {
        const termsSet = new Set<ITerm>();
        getRecursiveDefinitions(foundTerms, termsSet);
        nestedTerms.push(...Array.from(termsSet));
    }
    let output = [getTermsString(foundTerms)];

    if (nestedTerms.length) {


        output.push(getTermsString(nestedTerms));
    }

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
