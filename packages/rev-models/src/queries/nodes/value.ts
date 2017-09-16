import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { isFieldValue } from '../utils';
import { IModel } from '../../models/model';

export class ValueOperator<T extends IModel> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            model: new() => T,
            operator: string,
            public value: any,
            parent: IQueryNode<T>) {

        super(parser, model, operator, parent);
        if (!(this.operator in parser.FIELD_OPERATORS)) {
            throw new Error(`unrecognised field operator '${this.operator}'`);
        }
        else if (!isFieldValue(this.value)) {
            throw new Error(`invalid field value '${this.value}'`);
        }
    }
}
