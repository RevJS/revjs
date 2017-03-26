import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { IModelMeta } from '../../models/meta';

export class ValueListOperator<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);
        if (value) {

        }
    }
}