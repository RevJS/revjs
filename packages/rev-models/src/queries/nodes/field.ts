import { IModelMeta } from '../../models/meta';

import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';

export class FieldNode<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            public fieldName: string,
            value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, fieldName, meta, parent);
        if (value) {

        }
    }
}

export class ValueOperator<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            public operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);
        if (value) {

        }
    }
}

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
