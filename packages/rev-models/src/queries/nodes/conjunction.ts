
import { QueryNode } from './query';
import { IQueryParser, IQueryNode } from '../types';
import { IModel } from '../../models/model';

export class ConjunctionNode<T extends IModel> extends QueryNode<T> {

    constructor(
            parser: IQueryParser,
            model: new() => T,
            operator: string,
            value: any,
            parent: IQueryNode<T>) {

        super(parser, model, operator, parent);

        if (!(this.operator in parser.CONJUNCTION_OPERATORS)) {
            throw new Error(`unrecognised conjunction operator '${this.operator}'`);
        }
        if (!value || !(value instanceof Array)) {
            throw new Error(`value for '${this.operator}' must be an array`);
        }
        for (let elem of value) {
            this.assertIsNonEmptyObject(elem);
            this.children.push(parser.getQueryNodeForQuery(model, elem, this));
        }
    }
}
