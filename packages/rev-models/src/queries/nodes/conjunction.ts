
import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { Model } from '../../models/model';

export class ConjunctionNode<T extends Model> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            operator: string,
            value: any,
            model: new() => T,
            parent: IQueryNode<T>) {

        super(parser, operator, model, parent);

        if (!(this.operator in parser.CONJUNCTION_OPERATORS)) {
            throw new Error(`unrecognised conjunction operator '${this.operator}'`);
        }
        if (!value || !(value instanceof Array)) {
            throw new Error(`value for '${this.operator}' must be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(parser.getQueryNodeForQuery(elem, model, this));
        }
    }
}
