import { IModelMeta } from '../../models/meta';
import { pretty } from '../../utils/index';

export class QueryNode<T> {
    public children: Array<QueryNode<T>>;
    public result: boolean;

    constructor(
        public operator: string,
        public meta: IModelMeta<T>,
        public parent: QueryNode<T>) {

        this.children = [];
    }

    assertOperatorIsOneOf(operators: string[]) {
        if (operators.indexOf(this.operator) == -1) {
            throw new Error(`unrecognised operator '${this.operator}'`);
        }
    }

    assertIsNonEmptyObject(value: any) {
        if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`element ${pretty(value)} is not valid for '${this.operator}'`);
        }
    }

}