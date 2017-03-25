import { IModelMeta } from '../../models/meta';

import { QueryNode } from './query';

export class FieldNode<T> extends QueryNode<T> {

    constructor(
            public fieldName: string,
            value: any,
            meta: IModelMeta<T>,
            parent: QueryNode<T>) {

        super(fieldName, meta, parent);
        if (value) {

        }
    }
}

export class ValueOperator<T> extends QueryNode<T> {

    constructor(
            public operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: QueryNode<T>) {

        super(operator, meta, parent);
        if (value) {

        }
    }
}

export class ValueListOperator<T> extends QueryNode<T> {

    constructor(
            operator: string,
            value: any,
            meta: IModelMeta<T>,
            parent: QueryNode<T>) {

        super(operator, meta, parent);
        if (value) {

        }
    }
}