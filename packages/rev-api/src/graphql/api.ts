import { fields, IModelManager } from 'rev-models';

import { GraphQLSchema, GraphQLScalarType, GraphQLObjectType } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';
import { GraphQLSchemaConfig } from 'graphql/type/schema';
import { getQueryConfig } from './query/query';
import { getMutationConfig } from './mutation/mutation';
import { IModelApiManager, IGraphQLApi } from '../api/types';

export class GraphQLApi implements IGraphQLApi {
    _graphqlTypeMapping: Array<[new(...args: any[]) => fields.Field, GraphQLScalarType]>;

    constructor(private manager: IModelApiManager) {
        if (!manager || typeof manager.getApiMeta != 'function') {
            throw new Error(`GraphQLApi: Invalid ModelApiManager passed in constructor.`);
        }
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

    getApiManager() {
        return this.manager;
    }

    getModelManager(): IModelManager {
        return this.manager.getModelManager();
    }

    getGraphQLScalarType(field: fields.Field) {
        for (const fieldMapping of this._graphqlTypeMapping) {
            if (field instanceof fieldMapping[0]) {
                return fieldMapping[1];
            }
        }
        return GraphQLString;
    }

    getGraphQLSchema(): GraphQLSchema {

        const schema: GraphQLSchemaConfig = {} as any;

        const queryConfig = getQueryConfig(this);
        const mutationConfig = getMutationConfig(this.manager);

        schema.query = new GraphQLObjectType(queryConfig);
        if (mutationConfig) {
            schema.mutation = new GraphQLObjectType(mutationConfig);
        }

        return new GraphQLSchema(schema);
    }

}