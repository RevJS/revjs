import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { IModelMeta } from '../../models/meta';
import { isFieldValue } from '../query';

export class ValueOperator<T> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            public value: any,
            meta: IModelMeta<T>,
            parent: IQueryNode<T>) {

        super(parser, operator, meta, parent);
        if (!(this.operator in parser.FIELD_OPERATORS)) {
            throw new Error(`unrecognised field operator '${this.operator}'`);
        }
        else if (!isFieldValue(this.value)) {
            throw new Error(`invalid field value '${this.value}'`);
        }
    }
}
