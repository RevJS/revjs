import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { isFieldValue } from '../utils';
import { IModel } from '../../models/types';

export class ValueListOperator<T extends IModel> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            model: new() => T,
            operator: string,
            public values: any[],
            parent: IQueryNode<T>) {

        super(parser, model, operator, parent);
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
