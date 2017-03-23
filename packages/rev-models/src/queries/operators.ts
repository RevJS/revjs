
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

export type OperatorType = 'value' | 'value_list' | 'conjunction';

export const OPERATORS: { [key: string]: OperatorType } = {
    $gt: 'value',
    $gte: 'value',
    $lt: 'value',
    $lte: 'value',
    $ne: 'value',

    $in: 'value_list',
    $nin: 'value_list',

    $exists: 'value_list',

    $and: 'conjunction',
    $or: 'conjunction'
};

export const DEFAULT_OPERATOR = OPERATORS.$and;

export interface IWhereQuery {
    [fielName: string]: null | string | number | boolean | Date | IWhereQuery;
}
