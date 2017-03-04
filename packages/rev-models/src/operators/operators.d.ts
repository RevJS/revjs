import { ValueOperator, ValueListOperator, ConjunctionOperator } from './operatortypes';
export declare const OPERATORS: {
    $gt: ValueOperator;
    $gte: ValueOperator;
    $lt: ValueOperator;
    $lte: ValueOperator;
    $ne: ValueOperator;
    $in: ValueListOperator;
    $nin: ValueListOperator;
    $exists: ValueListOperator;
    $and: ConjunctionOperator;
    $or: ConjunctionOperator;
};
export interface IWhereQuery {
    [key: string]: null | string | number | boolean | Date | IWhereQuery;
}
