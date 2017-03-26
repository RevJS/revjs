
import { ConjunctionNode } from './nodes/conjunction';
import { ValueOperator, ValueListOperator, FieldNode } from './nodes/field';
import { IModelMeta } from '../models/meta';
import { IQueryParser, IQueryNode, IOperatorRegister } from './types';
import { pretty } from '../utils/index';
import { checkMetadataInitialised } from '../models/utils';

export class QueryParser implements IQueryParser {
    CONJUNCTION_OPERATORS: IOperatorRegister = {};
    FIELD_OPERATORS: IOperatorRegister = {};

    constructor() {
        this.registerConjunctionOperators({
            $and: ConjunctionNode,
            $or: ConjunctionNode
        });

        this.registerFieldOperators({
            $gt: ValueOperator,
            $gte: ValueOperator,
            $lt: ValueOperator,
            $lte: ValueOperator,
            $ne: ValueOperator,

            $in: ValueListOperator,
            $nin: ValueListOperator
        });
    }

    registerConjunctionOperators(operators: IOperatorRegister) {
        Object.assign(this.CONJUNCTION_OPERATORS, operators);
    };

    registerFieldOperators(operators: IOperatorRegister) {
        Object.assign(this.FIELD_OPERATORS, operators);
    };

    getQueryNodeForQuery<T>(
            value: any,
            meta: IModelMeta<T>,
            parent?: IQueryNode<T>): IQueryNode<T> {

        if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`${pretty(value)} is not a query object`);
        }

        checkMetadataInitialised(meta);

        let keys = Object.keys(value);
        if (keys.length == 1) {
            let key = keys[0];
            if (key in this.CONJUNCTION_OPERATORS) {
                return new (this.CONJUNCTION_OPERATORS[key])(this, key, value[key], meta, parent);
            }
            else if (key in meta.fieldsByName) {
                return new FieldNode(this, key, value[key], meta, parent);
            }
            throw new Error(`'${key}' is not a recognised field or conjunction operator`);
        }

        let queryTokens: any[] = [];
        for (let key of keys) {
            let token: any = {};
            token[key] = value[key];
            queryTokens.push(token);
        }
        return new this.CONJUNCTION_OPERATORS.$and(this, '$and', queryTokens, meta, parent);
    }
}
