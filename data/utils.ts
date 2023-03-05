import { IGlossary } from "./Glossary";

export function getExtraFields(glossary: IGlossary) {
    let extraFields: string[] = [];
    for (let i = 0; i < glossary.terms.length; i++) {
        extraFields = [
            ...extraFields,
            ...Object.keys(glossary.terms[i]).filter((field) =>
                field !== "term" && field !== "definition" && !extraFields.includes(field)
            )
        ];
    }

    return extraFields;
}