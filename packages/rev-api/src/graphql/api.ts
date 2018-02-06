import { fields, IModelManager } from 'rev-models';

import { GraphQLSchema, GraphQLObjectType, GraphQLResolveInfo, GraphQLList, FieldNode, GraphQLType, GraphQLInputObjectType } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';
import * as GraphQLJSON from 'graphql-type-json';
import { getMutationConfig } from './mutation/mutation';
import { IModelApiManager } from '../api/types';
import { NoModelsObjectType } from './types/NoModels';
import { ApiReadMetaObjectType } from './types/ApiReadMeta';
import { IGraphQLApi, IGraphQLFieldConverter } from './types';
import { IReadOptions, IModelMeta } from 'rev-models/lib/models/types';
import { IModelOperationResult } from '../../../rev-models/lib/operations/operationresult';

export class GraphQLApi implements IGraphQLApi {
    fieldConverters: Array<[new(...args: any[]) => fields.Field, IGraphQLFieldConverter]>;
    modelObjectTypes: { [modelName: string]: GraphQLObjectType } = {};
    modelInputTypes: { [modelName: string]: GraphQLInputObjectType } = {};

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
            [fields.SelectField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.MultiSelectField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],  // TODO: Should be array
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

    getGraphQLFieldConverter(field: fields.Field): IGraphQLFieldConverter {
        if (field instanceof fields.RelatedModelFieldBase) {
            let modelObjectType: GraphQLType = this.modelObjectTypes[field.options.model];
            if (!modelObjectType) {
                throw new Error(`GraphQLApi: Model field '${field.name}' is linked to a model '${field.options.model}', which is not registered with the api.`);
            }
            if (field instanceof fields.RelatedModelListField) {
                modelObjectType = new GraphQLList(modelObjectType);
            }
            return {
                type: modelObjectType,
                converter: (model, fieldName) => model[fieldName]
            };
        }
        else {
            for (const fieldMapping of this.fieldConverters) {
                if (field instanceof fieldMapping[0]) {
                    return fieldMapping[1];
                }
            }
        }
    }

    generateModelObject(modelName: string): GraphQLObjectType {
        let meta = this.getModelManager().getModelMeta(modelName);
        return new GraphQLObjectType({
            name: modelName,
            fields: () => {
                const fieldConfig = {};
                meta.fields.forEach((field) => {
                    let fieldConverter = this.getGraphQLFieldConverter(field);
                    if (fieldConverter) {
                        fieldConfig[field.name] = {
                            type: fieldConverter.type,
                            resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                                return fieldConverter.converter(rootValue, field.name);
                            }
                        };
                    }
                    else {
                        throw new Error(`GraphQLApi Error: The field class of ${modelName}.${field.name} does not have a registered mapping.`);
                    }

                });
                return fieldConfig;
            }
        });
    }

    getModelObject(modelName: string): GraphQLObjectType {
        return this.modelObjectTypes[modelName];
    }

    getModelInputObject(modelName: string): GraphQLInputObjectType {
        if (modelName in this.modelInputTypes) {
            return this.modelInputTypes[modelName];
        }
        else {
            let meta = this.getModelManager().getModelMeta(modelName);
            const fieldConfig = {};
            meta.fields.forEach((field) => {
                fieldConfig[field.name] = {
                    type: GraphQLString
                };
            });
            const inputObject = new GraphQLInputObjectType({
                name: modelName + '_input',
                fields: fieldConfig
            });
            this.modelInputTypes[modelName] = inputObject;
            return inputObject;
        }
    }

    getModelQueryResultsObject(modelName: string): GraphQLObjectType {
        let modelType = this.getModelObject(modelName);
        const objectConfig = {
            name: modelName + '_results',
            fields: {
                results: {
                    type: new GraphQLList(modelType),
                    resolve: (rootValue: IModelOperationResult<any, any>) => rootValue.results
                },
                meta: {
                    type: ApiReadMetaObjectType,
                    resolve: (rootValue: IModelOperationResult<any, any>) => rootValue.meta
                }
            }
        };
        return new GraphQLObjectType(objectConfig);
    }

    _findRelationalFieldNodes(node: FieldNode, meta: IModelMeta<any>, relatedNodes: any) {
        // For this node in the GraphQL Query, find all the sub-nodes that
        // are Relational fields (subclasses of RelatedModelFieldBase) and
        // record them in the "relatedNodes" object
        for (let selection of (node.selectionSet.selections as FieldNode[])) {
            let fieldName = selection.name.value;
            let field = meta.fieldsByName[fieldName];
            if (field instanceof fields.RelatedModelFieldBase) {
                let childMeta = this.manager.getModelManager().getModelMeta(field.options.model);
                relatedNodes[fieldName] = {};
                this._findRelationalFieldNodes(selection, childMeta, relatedNodes[fieldName]);
            }
        }
    }

    _listRelationalFields(relatedNodes: any, prefix: string, relatedList: string[]) {
        // Traverse the "relatedNodes" object and add all unique paths to the relatedList array
        // e.g. { a: { b: {}, c: {} }} becomes [ 'a.b', 'a.c' ]. These can then be passed to the
        // model backend so it can build a suitable query to include all related data.
        if (prefix && Object.keys(relatedNodes).length == 0) {
            relatedList.push(prefix);
        }
        else {
            prefix = prefix ? prefix + '.' : prefix;
            for (let key in relatedNodes) {
                this._listRelationalFields(relatedNodes[key], prefix + key, relatedList);
            }
        }
    }

    getQueryRelatedFieldList(info: GraphQLResolveInfo, meta: IModelMeta<any>): string[] {
        // Build the list of "related" fields in the query, to pass to rev-models
        const rootNode = info.fieldNodes[0];
        const resultsNode = rootNode.selectionSet.selections.find(
            (selection: FieldNode) => selection.name.value == 'results'
        ) as FieldNode;
        if (resultsNode) {
            const relatedNodes = {};
            const relatedList: string[] = [];
            this._findRelationalFieldNodes(resultsNode, meta, relatedNodes);
            this._listRelationalFields(relatedNodes, '', relatedList);
            return relatedList;
        }
        return [];
    }

    getSchemaQueryObject(): GraphQLObjectType {
        const readableModels = this.getReadableModels();
        if (readableModels.length == 0) {
            return NoModelsObjectType;
        }
        else {
            const models = this.getModelManager();
            const queryObjectConfig = {
                name: 'query',
                fields: {}
            };
            for (let modelName of readableModels) {
                let modelMeta = models.getModelMeta(modelName);
                queryObjectConfig.fields[modelName] = {
                    type: this.getModelQueryResultsObject(modelName),
                    args: {
                        where: { type: GraphQLJSON },
                        limit: { type: GraphQLInt },
                        offset: { type: GraphQLInt },
                        orderBy: { type: new GraphQLList(GraphQLString) }

                    },
                    resolve: (rootValue: any, args?: any, context?: any, info?: GraphQLResolveInfo): Promise<any> => {
                        let selectedRelationalFields = this.getQueryRelatedFieldList(info, modelMeta);
                        let whereClause = {};
                        let readOptions: IReadOptions = {
                            related: selectedRelationalFields
                        };
                        if (args) {
                            if (args.where) {
                                if (typeof args.where != 'object') {
                                    throw new Error(`GraphQLApi Error: The "where" argument must be an object.`);
                                }
                                whereClause = args.where;
                            }
                            if (args.limit) {
                                readOptions.limit = args.limit;
                            }
                            if (args.offset) {
                                readOptions.offset = args.offset;
                            }
                            if (args.orderBy) {
                                readOptions.orderBy = args.orderBy;
                            }
                        }
                        return models.read(modelMeta.ctor, whereClause, readOptions);
                    }
                };
            }
            return new GraphQLObjectType(queryObjectConfig);
        }
    }

    getSchema(): GraphQLSchema {

        const readableModels = this.manager.getModelNamesByOperation('read');
        readableModels.forEach((modelName) => {
            this.modelObjectTypes[modelName] = this.generateModelObject(modelName);
        });

        const mutations = getMutationConfig(this);

        return new GraphQLSchema({
            query: this.getSchemaQueryObject(),
            mutation: mutations ? new GraphQLObjectType(mutations) : undefined
        });
    }

}