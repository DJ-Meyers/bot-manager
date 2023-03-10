import { IGlossary } from "../data/Glossary";
import { ITerm } from "../data/Term";
import { getExtraFields } from "../data/utils";

export function findBracketedWords(input: string) {
    const regex = /\[\[([\w-]+)\]\]/g;
    const escapedText = input.replace(/[()]/g, '\\$&');
    const results = [...escapedText.matchAll(regex)];
    
    const words = results.map((match) => match[1])
    return words;
}

export function getCommentFormat(glossary: IGlossary, commentText: string) {

    const extraFields = getExtraFields(glossary);
    const bracketedWords = findBracketedWords(commentText);
    let foundTerms = getTerms(bracketedWords);

    function getTerms(words: string[]): ITerm[] {
        return glossary.terms.filter((term) => words?.includes(term.term));
    }

    function getRecursiveDefinitions(terms: ITerm[], set: Set<ITerm>) {
        if (!terms || !terms.filter((term) => !set.has(term)).length) return;

        terms.forEach((term) => { 
            const nestedTerms = getTerms(findBracketedWords(term.definition));
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


`
        );
    }

    function getOwnerString() {
        return glossary.owners.length > 1 ?
            "/u/" + glossary.owners.slice(0, -1).join(", /u/") + " or /u/" + glossary.owners.slice(-1)
            :
            "/u/" + glossary.owners[0];
    }


    const output = [];
    if (foundTerms.length) {
        
        output.push(getTermsString(foundTerms));
        
        const nestedTerms: ITerm[] = [];
        if (glossary.commentOptions?.recursiveDefinitions) {
            const termsSet = new Set<ITerm>();
            getRecursiveDefinitions(foundTerms, termsSet);
            nestedTerms.push(...Array.from(termsSet));
            
            if (nestedTerms.length) {
                output.push(getTermsString(nestedTerms));
            }
        }

        if (glossary.commentOptions?.showOwners) {
            output.push(`Contact ${getOwnerString()} if you have any concerns`);
        }

        if (glossary.commentOptions?.additionalMessage) {
            output.push(glossary.commentOptions.additionalMessage);
        }
    }

    
    
    return output.length  ? output.join(glossary.commentOptions?.showDividers ? `

---

`
        : `


`
    ) : `I couldn't find the term ${bracketedWords.map((bw) => `[[${bw}]]`).join(", ")}.  If you think this is an error, contact ${getOwnerString()}`;
}
