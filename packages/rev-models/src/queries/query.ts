
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

export function isFieldValue(value: any) {
    return (typeof value == 'string'
        || typeof value == 'boolean'
        || (typeof value == 'number' && !isNaN(value))
        || (typeof value == 'object' && value instanceof Date)
        || value === null);
}