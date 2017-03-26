import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { IModelMeta } from '../../models/meta';
import { isFieldValue } from '../query';

export class ValueOperator<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            public operator: string,
            public value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);
        if (!isFieldValue(value)) {
            throw new Error(`invalid field value '${value}'`);
        }
    }
}
