import { IModelMeta } from '../../models/meta';
import { IQueryParser, IQueryNode } from '../types';

import { pretty } from '../../utils/index';

export class QueryNode<T> implements IQueryNode<T> {
    public children: Array<IQueryNode<T>>;

    constructor(
        public parser: IQueryParser,
        public operator: string,
        public meta: IModelMeta,
        public parent: IQueryNode<T>) {

        this.children = [];
    }

    assertIsNonEmptyObject(value: any) {
        if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`element ${pretty(value)} is not valid for '${this.operator}'`);
        }
    }

}
