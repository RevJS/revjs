import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { isFieldValue } from '../query';
import { Model } from '../../models/model';

export class ValueOperator<T extends Model> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            public value: any,
            model: new() => T,
            parent: IQueryNode<T>) {

        super(parser, operator, model, parent);
        if (!(this.operator in parser.FIELD_OPERATORS)) {
            throw new Error(`unrecognised field operator '${this.operator}'`);
        }
        else if (!isFieldValue(this.value)) {
            throw new Error(`invalid field value '${this.value}'`);
        }
    }
}
