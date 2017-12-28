import { fields, IModelManager } from 'rev-models';

import { GraphQLSchema, GraphQLScalarType, GraphQLObjectType, GraphQLList } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';
import { GraphQLSchemaConfig } from 'graphql/type/schema';
import { getQueryConfig } from './query/query';
import { getMutationConfig } from './mutation/mutation';
import { IModelApiManager, IGraphQLApi } from '../api/types';

export class GraphQLApi implements IGraphQLApi {
    fieldTypeMap: Array<[new(...args: any[]) => fields.Field, GraphQLScalarType]>;
    modelObjectTypes: { [modelName: string]: GraphQLObjectType } = {};

    constructor(private manager: IModelApiManager) {
        if (!manager || typeof manager.getApiMeta != 'function') {
            throw new Error(`GraphQLApi: Invalid ModelApiManager passed in constructor.`);
        }
        this.fieldTypeMap = [
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

    getReadableModels(): string[] {
        return Object.keys(this.modelObjectTypes);
    }

    getGraphQLScalarType(field: fields.Field) {
        for (const fieldMapping of this.fieldTypeMap) {
            if (field instanceof fieldMapping[0]) {
                return fieldMapping[1];
            }
        }
    }

    generateModelObjectType(modelName: string): GraphQLObjectType {
        let meta = this.getModelManager().getModelMeta(modelName);
        let config = {
            name: modelName,
            fields: {}
        };
        for (let field of meta.fields) {
            let scalarType = this.getGraphQLScalarType(field);
            if (scalarType) {
                config.fields[field.name] = {
                    type: scalarType,
                    resolve: (value: any, args: any, context: any) => {
                        return value[field.name];
                    }
                };
            }
            else if (field instanceof fields.RelatedModelField) {
                config.fields[field.name] = () => ({
                    type: this.modelObjectTypes[field.options.model],
                    resolve: (value: any, args: any, context: any) => {
                        return {};
                    }
                });
            }
            else if (field instanceof fields.RelatedModelListField) {
                config.fields[field.name] = () => ({
                    type: new GraphQLList(this.modelObjectTypes[field.options.model]),
                    resolve: (value: any, args: any, context: any) => {
                        return [{}];
                    }
                });
            }
            else {
                throw new Error(`GraphQLApi Error: The field class of ${modelName}.${field.name} does not have a registered mapping.`);
            }
        }
        return new GraphQLObjectType(config);
    }

    getModelObjectType(modelName: string): GraphQLObjectType {
        return this.modelObjectTypes[modelName];
    }

    getGraphQLSchema(): GraphQLSchema {

        const readableModels = this.manager.getModelNamesByOperation('read');
        readableModels.forEach((modelName) => {
            this.modelObjectTypes[modelName] = this.generateModelObjectType(modelName);
        });

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