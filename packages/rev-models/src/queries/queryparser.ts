
import { ConjunctionNode, FieldNode, ValueOperator, ValueListOperator } from './nodes';

import { IQueryParser, IQueryNode, IOperatorRegister } from './types';
import { printObj } from '../utils/index';
import { IModel, IModelManager } from '../models/types';

/**
 * @private
 */
export class QueryParser implements IQueryParser {
    CONJUNCTION_OPERATORS: IOperatorRegister = {};
    FIELD_OPERATORS: IOperatorRegister = {};
    OPERATOR_PREFIX: string = '_';

    constructor(public manager: IModelManager) {

        this.registerConjunctionOperators({
            and: ConjunctionNode,
            or: ConjunctionNode
        });

        this.registerFieldOperators({
            eq: ValueOperator,
            ne: ValueOperator,
            gt: ValueOperator,
            gte: ValueOperator,
            lt: ValueOperator,
            lte: ValueOperator,
            like: ValueOperator,

            in: ValueListOperator,
            nin: ValueListOperator
        });
    }

    registerConjunctionOperators(operators: IOperatorRegister) {
        Object.assign(this.CONJUNCTION_OPERATORS, operators);
    }

    registerFieldOperators(operators: IOperatorRegister) {
        Object.assign(this.FIELD_OPERATORS, operators);
    }

    isConjunctionOperator(prefixedOperatorName: string) {
        return Boolean(Object.keys(this.CONJUNCTION_OPERATORS)
            .find((operator) => this.OPERATOR_PREFIX + operator == prefixedOperatorName));
    }

    isFieldOperator(prefixedOperatorName: string) {
        return Boolean(Object.keys(this.FIELD_OPERATORS)
            .find((operator) => this.OPERATOR_PREFIX + operator == prefixedOperatorName));
    }

    getUnprefixedOperatorName(prefixedOperatorName: string) {
        const prefix = this.OPERATOR_PREFIX;
        if (typeof prefixedOperatorName == 'string'
            && prefixedOperatorName.substr(0, prefix.length) == prefix) {
                return prefixedOperatorName.substr(prefix.length);
        }
        return prefixedOperatorName;
    }

    getQueryNodeForQuery<T extends IModel>(
            model: new() => T,
            value: object,
            parent?: IQueryNode<T>): IQueryNode<T> {

        if (!value || typeof value != 'object') {
            throw new Error(`${printObj(value)} is not a query object`);
        }

        const meta = this.manager.getModelMeta(model);

        let keys = Object.keys(value);
        if (keys.length == 1) {
            let key = keys[0];
            if (this.isConjunctionOperator(key)) {
                const opName = this.getUnprefixedOperatorName(key);
                return new (this.CONJUNCTION_OPERATORS[opName])(this, model, key, value[key], parent);
            }
            else if (key in meta.fieldsByName) {
                return new FieldNode(this, model, key, value[key], parent);
            }
            throw new Error(`'${key}' is not a recognised field or conjunction operator`);
        }

        let queryTokens: any[] = [];
        for (let key of keys) {
            let token: any = {};
            token[key] = value[key];
            queryTokens.push(token);
        }
        return new this.CONJUNCTION_OPERATORS.and(this, model, '_and', queryTokens, parent);
    }
}
