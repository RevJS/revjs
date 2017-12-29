
import { IModel, IModelManager } from '../models/types';

export interface IQueryNode<T extends IModel> {
    operator: string;
    parent: IQueryNode<T>;
    children: Array<IQueryNode<T>>;
}

export interface IOperatorRegister {
    [operator: string]: new(
            parser: IQueryParser,
            model: new() => IModel,
            operator: string,
            value: any,
            parent: IQueryNode<any>) => IQueryNode<any>;
}

export interface IQueryParser {
    manager: IModelManager;
    OPERATOR_PREFIX: string;
    CONJUNCTION_OPERATORS: IOperatorRegister;
    FIELD_OPERATORS: IOperatorRegister;

    registerFieldOperators(operators: IOperatorRegister): void;
    registerConjunctionOperators(operators: IOperatorRegister): void;

    isFieldOperator(prefixedOperatorName: string): boolean;
    isConjunctionOperator(prefixedOperatorName: string): boolean;
    getUnprefixedOperatorName(prefixedOperatorName: string): string;

    getQueryNodeForQuery<T extends IModel>(
        model: new() => T,
        value: any,
        parent?: IQueryNode<T>): IQueryNode<T>;
}
