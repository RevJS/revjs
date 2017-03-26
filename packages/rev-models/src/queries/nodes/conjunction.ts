import { IModelMeta } from '../../models/meta';

import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';

export class ConjunctionNode<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);

        if (!(this.operator in parser.CONJUNCTION_OPERATORS)) {
            throw new Error(`unrecognised conjunction operator '${this.operator}'`);
        }
        if (!value || !(value instanceof Array)) {
            throw new Error(`value for '${this.operator}' must be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(parser.getQueryNodeForQuery(elem, meta, this));
        }
    }
}
