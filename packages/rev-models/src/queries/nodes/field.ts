
import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { isFieldValue } from '../utils';
import { ValueOperator } from './value';
import { IModel } from '../../models/types';

export class FieldNode<T extends IModel> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            model: new() => T,
            public fieldName: string,
            value: any,
            parent: IQueryNode<T>) {

        super(parser, model, fieldName, parent);

        const meta = parser.manager.getModelMeta(model);

        if (!(fieldName in meta.fieldsByName)) {
            throw new Error(`'${fieldName}' is not a recognised field`);
        }
        else if (isFieldValue(value)) {
            this.children.push(new ValueOperator(parser, model, '_eq', value, this));
        }
        else if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`invalid field query value for field '${fieldName}'`);
        }
        else {
            let keys = Object.keys(value);
            for (let key of keys) {
                if (!parser.isFieldOperator(key)) {
                    throw new Error(`unrecognised field operator '${key}'`);
                }
                else {
                    const opName = parser.getUnprefixedOperatorName(key);
                    this.children.push(new parser.FIELD_OPERATORS[opName](parser, model, key, value[key], this));
                }
            }
        }
    }

}
