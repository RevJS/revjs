
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

import { pretty } from '../utils/index';
import { IModelMeta } from '../models/meta';
import { checkMetadataInitialised } from '../models/utils';

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
export function getQueryObjectOperator<T>(
        value: any,
        meta: IModelMeta<T>,
        parent?: Operator<T>) {

    if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
        throw new Error(`${pretty(value)} is not a query object`);
    }

    checkMetadataInitialised(meta);

    let keys = Object.keys(value);
    if (keys.length == 1) {
        let key = keys[0];
        if (conjunctionOperators.indexOf(key) > -1) {
            return new ConjunctionOperator(key, value[key], meta, parent);
        }
        else if (key in meta.fieldsByName) {
            return new FieldOperator(key, value[key], meta, parent);
        }
        throw new Error(`'${key}' is not a recognised field or conjunction operator`);
    }

    let queryTokens: any[] = [];
    for (let key of keys) {
        let token: any = {};
        token[key] = value[key];
        queryTokens.push(token);
    }
    return new ConjunctionOperator('$and', queryTokens, meta, parent);
}

export class Operator<T> {
    public children: Array<Operator<T>>;
    public result: boolean;

    constructor(
        public operator: string,
        public meta: IModelMeta<T>,
        public parent: Operator<T>) {

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

export class ConjunctionOperator<T> extends Operator<T> {

    constructor(
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: Operator<T>) {

        super(operator, meta, parent);
        this.assertOperatorIsOneOf(conjunctionOperators);
        if (!value || !(value instanceof Array)) {
            throw new Error(`${pretty(value)} should be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(getQueryObjectOperator(elem, meta, this));
        }
    }
}

export class FieldOperator<T> extends Operator<T> {

    constructor(
            public fieldName: string,
            value: any,
            meta: IModelMeta<T>,
            parent: Operator<T>) {

        super(fieldName, meta, parent);
        if (value) {

        }
    }
}

export class ValueOperator<T> extends Operator<T> {

    constructor(
            public operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: Operator<T>) {

        super(operator, meta, parent);
        if (value) {

        }
    }
}

export class ValueListOperator<T> extends Operator<T> {

    constructor(
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: Operator<T>) {

        super(operator, meta, parent);
        if (value) {

        }
    }
}

export interface IWhereQuery {
    [fielName: string]: null | string | number | boolean | Date | IWhereQuery;
}
