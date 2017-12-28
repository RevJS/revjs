import { IModelManager } from 'rev-models/lib/models/types';
import { IModel, fields } from 'rev-models';
import { GraphQLScalarType } from 'graphql';

export interface IApiMethodMeta {
    args?: fields.Field[];
    modelData?: boolean;
}

export interface IApiMeta {
    model?: string;
    operations?: string[];
    methods?: {
        [methodName: string]: IApiMethodMeta;
    };
}

export interface IModelApiManager {

    getModelManager(): IModelManager;
    isRegistered(modelName: string): boolean;
    register<T extends IModel>(model: new(...args: any[]) => T, apiMeta?: IApiMeta): void;

    getModelNames(): string[];
    getModelNamesByOperation(operationName: string): string[];

    getApiMeta(modelName: string): IApiMeta;
    clearManager(): void;
}

export interface IGraphQLApiMeta {
    getGraphQLScalarType(field: fields.Field): GraphQLScalarType;
}