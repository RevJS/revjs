import { ValueOperator, ValueListOperator, ConjunctionOperator } from './operatortypes';

// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

export const OPERATORS = {
    $gt: new ValueOperator(),
    $gte: new ValueOperator(),
    $lt: new ValueOperator(),
    $lte: new ValueOperator(),
    $ne: new ValueOperator(),

    $in: new ValueListOperator(),
    $nin: new ValueListOperator(),

    $exists: new ValueListOperator(),

    $and: new ConjunctionOperator(),
    $or: new ConjunctionOperator()
};

export interface IWhereQuery {
    [key: string]: null | string | number | boolean | Date | IWhereQuery;
}
