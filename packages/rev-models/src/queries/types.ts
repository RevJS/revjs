
import { Model } from '../models/model';

export interface IQueryNode<T extends Model> {
    operator: string;
    parent: IQueryNode<T>;
    children: Array<IQueryNode<T>>;
}

export interface IOperatorRegister {
    [operator: string]: new(
            parser: IQueryParser,
            operator: string,
            value: any,
            model: new() => Model,
            parent: IQueryNode<any>) => IQueryNode<any>;
}

export interface IQueryParser {
    CONJUNCTION_OPERATORS: IOperatorRegister;
    FIELD_OPERATORS: IOperatorRegister;

    registerFieldOperators(operators: IOperatorRegister): void;
    registerConjunctionOperators(operators: IOperatorRegister): void;

    getQueryNodeForQuery<T extends Model>(
        value: any,
        model: new() => T,
        parent?: IQueryNode<T>): IQueryNode<T>;
}
