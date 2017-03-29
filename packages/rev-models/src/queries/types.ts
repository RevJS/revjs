import { IModelMeta } from '../models/meta';

export interface IQueryNode<T> {
    operator: string;
    parent: IQueryNode<T>;
    children: Array<IQueryNode<T>>;
}

export interface IOperatorRegister {
    [operator: string]: new(
            parser: IQueryParser,
            operator: string,
            value: any,
            meta: IModelMeta<any>,
            parent: IQueryNode<any>) => IQueryNode<any>;
}

export interface IQueryParser {
    CONJUNCTION_OPERATORS: IOperatorRegister;
    FIELD_OPERATORS: IOperatorRegister;

    registerFieldOperators(operators: IOperatorRegister): void;
    registerConjunctionOperators(operators: IOperatorRegister): void;

    getQueryNodeForQuery<T>(
        value: any,
        meta: IModelMeta,
        parent?: IQueryNode<T>): IQueryNode<T>;
}
