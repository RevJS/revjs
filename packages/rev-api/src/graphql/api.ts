import { fields, IModelManager } from 'rev-models';

import { GraphQLSchema, GraphQLObjectType, GraphQLResolveInfo } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';
import { GraphQLSchemaConfig } from 'graphql/type/schema';
import { getQueryConfig } from './query/query';
import { getMutationConfig } from './mutation/mutation';
import { IModelApiManager } from '../api/types';
import { IGraphQLApi, IGraphQLFieldConverter } from './types';

export class GraphQLApi implements IGraphQLApi {
    fieldConverters: Array<[new(...args: any[]) => fields.Field, IGraphQLFieldConverter]>;
    modelObjectTypes: { [modelName: string]: GraphQLObjectType } = {};

    constructor(private manager: IModelApiManager) {
        if (!manager || typeof manager.getApiMeta != 'function') {
            throw new Error(`GraphQLApi: Invalid ModelApiManager passed in constructor.`);
        }
        this.fieldConverters = [
            [fields.AutoNumberField, { type: GraphQLInt, converter: (model, fieldName) => model[fieldName] }],
            [fields.IntegerField, { type: GraphQLInt, converter: (model, fieldName) => model[fieldName] }],
            [fields.NumberField, { type: GraphQLFloat, converter: (model, fieldName) => model[fieldName] }],
            [fields.TextField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.BooleanField, { type: GraphQLBoolean, converter: (model, fieldName) => model[fieldName] }],
            [fields.SelectionField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.DateField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.TimeField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.DateTimeField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
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

    getGraphQLFieldConverter(field: fields.Field) {
        for (const fieldMapping of this.fieldConverters) {
            if (field instanceof fieldMapping[0]) {
                return fieldMapping[1];
            }
        }
    }

    generateModelObjectType(modelName: string): GraphQLObjectType {

        let meta = this.getModelManager().getModelMeta(modelName);

        return new GraphQLObjectType({
            name: modelName,
            fields: () => {

                const fieldConfig = {};

                meta.fields.forEach((field) => {

                    let scalarType = this.getGraphQLFieldConverter(field);
                    if (scalarType) {
                        fieldConfig[field.name] = {
                            type: scalarType.type,
                            resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                                return scalarType.converter(rootValue, field.name);
                            }
                        };
                    }
                    else if (field instanceof fields.RelatedModelField) {
                        // fieldConfig[field.name] = {
                        //     type: this.modelObjectTypes[field.options.model],
                        //     resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                        //         return {};
                        //     }
                        // };
                    }
                    else if (field instanceof fields.RelatedModelListField) {
                        // fieldConfig[field.name] = {
                        //     type: new GraphQLList(this.modelObjectTypes[field.options.model]),
                        //     resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                        //         return [{}];
                        //     }
                        // };
                    }
                    else {
                        throw new Error(`GraphQLApi Error: The field class of ${modelName}.${field.name} does not have a registered mapping.`);
                    }

                });
                return fieldConfig;
            }
        });
    }

    getModelObjectType(modelName: string): GraphQLObjectType {
        return this.modelObjectTypes[modelName];
    }

    getSchema(): GraphQLSchema {

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