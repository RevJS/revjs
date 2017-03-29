import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { IModelMeta } from '../../models/meta';
import { isFieldValue } from '../query';

export class ValueListOperator<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            public values: any,
            meta: IModelMeta,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);
        if (!(this.operator in parser.FIELD_OPERATORS)) {
            throw new Error(`unrecognised field operator '${this.operator}'`);
        }
        if (!this.values || !(this.values instanceof Array)) {
            throw new Error(`value for '${this.operator}' must be an array`);
        }
        for (let elem of this.values) {
            if (!isFieldValue(elem)) {
                throw new Error(`invalid field value '${elem}'`);
            }
        }
    }
}
