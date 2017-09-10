
import { Model } from '../models/model';
import { ModelManager } from '../registry/registry';

export interface IQueryNode<T extends Model> {
    operator: string;
    parent: IQueryNode<T>;
    children: Array<IQueryNode<T>>;
}

export interface IOperatorRegister {
    [operator: string]: new(
            parser: IQueryParser,
            model: new() => Model,
            operator: string,
            value: any,
            parent: IQueryNode<any>) => IQueryNode<any>;
}

export interface IQueryParser {
    manager: ModelManager;
    CONJUNCTION_OPERATORS: IOperatorRegister;
    FIELD_OPERATORS: IOperatorRegister;

    registerFieldOperators(operators: IOperatorRegister): void;
    registerConjunctionOperators(operators: IOperatorRegister): void;

    getQueryNodeForQuery<T extends Model>(
        model: new() => T,
        value: any,
        parent?: IQueryNode<T>): IQueryNode<T>;
}
