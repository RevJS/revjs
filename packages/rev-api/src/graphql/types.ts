
import { IModelManager, IModel } from 'rev-models/lib/models/types';
import { IModelApiManager } from '../api/types';
import { fields } from 'rev-models';
import { GraphQLObjectType, GraphQLType } from 'graphql';

export interface IGraphQLApi {
    getModelManager(): IModelManager;
    getApiManager(): IModelApiManager;
    getReadableModels(): string[];
    getGraphQLFieldConverter(field: fields.Field): IGraphQLFieldConverter;
    getModelObject(modelName: string): GraphQLObjectType;
}

export interface IGraphQLFieldConverter {
    type: GraphQLType;
    converter(model: IModel, fieldName: string): any;
}
