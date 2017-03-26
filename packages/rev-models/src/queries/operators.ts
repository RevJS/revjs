
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

export interface IWhereQuery {
    [fieldOrOperator: string]: null | string | number | boolean | Date | IWhereQuery;
}
