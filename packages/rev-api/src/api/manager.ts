
import { ModelManager, IModel, fields } from 'rev-models';
import { checkIsModelConstructor } from 'rev-models/lib/models/utils';
import { IApiMeta, initialiseApiMeta } from '../api/meta';
import { getGraphQLSchema } from '../graphql/schema';
import { GraphQLSchema, GraphQLScalarType } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';

export class ModelApiManager {

    modelManager: ModelManager;
    _apiMeta: {
        [modelName: string]: IApiMeta
    };
    _graphqlTypeMapping: Array<[new(...args: any[]) => fields.Field, GraphQLScalarType]>;

    constructor(modelManager: ModelManager) {
        if (typeof modelManager != 'object' || !(modelManager instanceof ModelManager)) {
            throw new Error(`ApiManagerError: Invalid ModelManager passed in constructor.`);
        }
        this.modelManager = modelManager;
        this._apiMeta = {};
        this._graphqlTypeMapping = [
            [fields.AutoNumberField, GraphQLInt],
            [fields.IntegerField, GraphQLInt],
            [fields.NumberField, GraphQLFloat],
            [fields.TextField, GraphQLString],
            [fields.BooleanField, GraphQLBoolean],
            [fields.SelectionField, GraphQLString],
            [fields.DateField, GraphQLString],
            [fields.TimeField, GraphQLString],
            [fields.DateTimeField, GraphQLString],
        ];
    }

    getModelManager() {
        return this.modelManager;
    }

    isRegistered(modelName: string) {
        return (modelName && (modelName in this._apiMeta));
    }

    register<T extends IModel>(model: new(...args: any[]) => T, apiMeta?: IApiMeta) {
        // Add api meta to the registry if valid
        checkIsModelConstructor(model);
        apiMeta = initialiseApiMeta(this, model, apiMeta);
        this._apiMeta[apiMeta.model] = apiMeta;
    }

    getModelNames(): string[] {
        return Object.keys(this._apiMeta);
    }

    getModelNamesByOperation(operationName: string): string[] {
        let matches: string[] = [];
        for (let modelName in this._apiMeta) {
            if (this._apiMeta[modelName].operations.indexOf(operationName) > -1) {
                matches.push(modelName);
            }

        }
        return matches;
    }

    getApiMeta(modelName: string): IApiMeta {
        if (!(modelName in this._apiMeta)) {
            throw new Error(`ApiManagerError: Model '${modelName}' does not have a registered API.`);
        }
        return this._apiMeta[modelName];
    }

    getGraphQLSchema(): GraphQLSchema {
        return getGraphQLSchema(this);
    }

    getGraphQLScalarType(field: fields.Field) {
        for (const fieldMapping of this._graphqlTypeMapping) {
            if (field instanceof fieldMapping[0]) {
                return fieldMapping[1];
            }
        }
        return GraphQLString;
    }

    clearManager() {
        this._apiMeta = {};
    }
}
