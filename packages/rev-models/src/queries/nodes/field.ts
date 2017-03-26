import { IModelMeta } from '../../models/meta';

import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { isFieldValue } from '../query';

export class FieldNode<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            public fieldName: string,
            value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, fieldName, meta, parent);

        if (!(fieldName in meta.fieldsByName)) {
            throw new Error(`'${fieldName}' is not a recognised field`);
        }
        else if (isFieldValue(value)) {
            this.children.push(new ValueOperator(parser, '$eq', value, meta, this));
        }
        else if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`invalid field query value for field '${fieldName}'`);
        }
        else {
            let keys = Object.keys(value);
            for (let key of keys) {
                if (!(key in parser.FIELD_OPERATORS)) {
                    throw new Error(`unrecognised field operator '${key}'`);
                }
                else {
                    this.children.push(new parser.FIELD_OPERATORS[key](parser, key, value[key], meta, this));
                }
            }
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
