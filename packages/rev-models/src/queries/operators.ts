
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

import { pretty } from '../utils/index';

const validFields = ['a', 'b', 'c'];
const conjunctionOperators = ['$and', '$or'];

export const OPERATORS = {
    $gt: ValueOperator,
    $gte: ValueOperator,
    $lt: ValueOperator,
    $lte: ValueOperator,
    $ne: ValueOperator,

    $in: ValueListOperator,
    $nin: ValueListOperator,

    $and: ConjunctionOperator,
    $or: ConjunctionOperator
};

// Returns an Operator tree for a query object
export function getQueryObjectOperator(parent: Operator, value: any) {
    if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
        throw new Error(`${pretty(value)} is not a query object`);
    }
    let keys = Object.keys(value);
    if (keys.length == 1) {
        let key = keys[0];
        if (conjunctionOperators.indexOf(key) > -1) {
            return new ConjunctionOperator(parent, key, value[key]);
        }
        else if (validFields.indexOf(key) > -1) {
            return new FieldOperator(parent, key, value[key]);
        }
        throw new Error(`'${key}' is not a recognised field or conjunction operator`);
    }
    let queryTokens: any[] = [];
    for (let key of keys) {
        let token: any = {};
        token[key] = value[key];
        queryTokens.push(token);
    }
    return new ConjunctionOperator(parent, '$and', queryTokens);
}

export class Operator {
    public children: Operator[];
    public result: boolean;

    constructor(
        public parent: Operator,
        public operator: string) {

        this.children = [];
    }

    assertOperatorIsOneOf(operators: string[]) {
        if (operators.indexOf(this.operator) == -1) {
            throw new Error(`unrecognised operator '${this.operator}'`);
        }
    }

    assertIsNonEmptyObject(value: any) {
        if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`element ${pretty(value)} is not valid for '${this.operator}'`);
        }
    }

}

export class ConjunctionOperator extends Operator {
    constructor(parent: Operator, operator: string, value: any) {
        super(parent, operator);
        this.assertOperatorIsOneOf(conjunctionOperators);
        if (!value || !(value instanceof Array)) {
            throw new Error(`${pretty(value)} should be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(getQueryObjectOperator(this, elem));
        }
    }
}

export class FieldOperator extends Operator {

    constructor(
            parent: Operator,
            public fieldName: string,
            value: any) {
        super(parent, fieldName);
        if (value) {

        }
    }
}

export class ValueOperator extends Operator {

    constructor(
            parent: Operator,
            public operator: string,
            value: any) {
        super(parent, operator);
        if (value) {

        }
    }
}

export class ValueListOperator extends Operator {
    constructor(parent: Operator, operator: string, value: any) {
        super(parent, operator);
        if (value) {

        }
    }
}

export interface IWhereQuery {
    [fielName: string]: null | string | number | boolean | Date | IWhereQuery;
}
