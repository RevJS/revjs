
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/

import { pretty } from '../utils/index';
import { IModelMeta } from '../models/meta';
import { checkMetadataInitialised } from '../models/utils';

import { QueryNode } from './nodes/query';
import { FieldNode, ValueOperator, ValueListOperator } from './nodes/field';
import { ConjunctionNode } from './nodes/conjunction';

export const CONJUNCTION_OPERATORS = ['$and', '$or'];

export const OPERATORS = {
    $gt: ValueOperator,
    $gte: ValueOperator,
    $lt: ValueOperator,
    $lte: ValueOperator,
    $ne: ValueOperator,

    $in: ValueListOperator,
    $nin: ValueListOperator,

    $and: ConjunctionNode,
    $or: ConjunctionNode
};

export interface IWhereQuery {
    [fieldOrOperator: string]: null | string | number | boolean | Date | IWhereQuery;
}

// Returns a QueryNode tree for a query object
export function getQueryNodeForQuery<T>(
        value: any,
        meta: IModelMeta<T>,
        parent?: QueryNode<T>): QueryNode<T> {

    if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
        throw new Error(`${pretty(value)} is not a query object`);
    }

    checkMetadataInitialised(meta);

    let keys = Object.keys(value);
    if (keys.length == 1) {
        let key = keys[0];
        if (CONJUNCTION_OPERATORS.indexOf(key) > -1) {
            return new (OPERATORS[key])(key, value[key], meta, parent);
        }
        else if (key in meta.fieldsByName) {
            return new FieldNode(key, value[key], meta, parent);
        }
        throw new Error(`'${key}' is not a recognised field or conjunction operator`);
    }

    let queryTokens: any[] = [];
    for (let key of keys) {
        let token: any = {};
        token[key] = value[key];
        queryTokens.push(token);
    }
    return new OPERATORS.$and('$and', queryTokens, meta, parent);
}
