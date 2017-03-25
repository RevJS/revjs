import { IModelMeta } from '../../models/meta';
import { CONJUNCTION_OPERATORS, getQueryNodeForQuery } from '../operators';
import { pretty } from '../../utils/index';

import { QueryNode } from './query';

export class ConjunctionNode<T> extends QueryNode<T> {

    constructor(
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: QueryNode<T>) {

        super(operator, meta, parent);
        this.assertOperatorIsOneOf(CONJUNCTION_OPERATORS);
        if (!value || !(value instanceof Array)) {
            throw new Error(`${pretty(value)} should be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(getQueryNodeForQuery(elem, meta, this));
        }
    }
}