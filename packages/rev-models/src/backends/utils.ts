import { IReadOptions, IModelManager, IModelMeta, IModel } from '../models/types';
import { IModelOperationResult } from '../operations/operationresult';
import { RelatedModelField, RelatedModelListField } from '../fields';

/**
 * @private
 */
export interface IForeignKeyValues {
    [fieldName: string]: any[];
}

/**
 * @private
 */
export interface IRelatedModelInstances {
    [fieldName: string]: {
        [keyValue: string]: IModel
    };
}

/**
 * @private
 */
export interface IRelatedModelListInstances {
    [fieldName: string]: {
        [keyValue: string]: IModel[]
    };
}

/**
 * @private
 */
export function getOwnRelatedFieldNames(related: string[]) {
    return related && related.map((fieldName) => {
        return fieldName.split('.')[0];
    });
}

/**
 * @private
 */
export function getChildRelatedFieldNames(related: string[], parent: string) {
    if (related) {
        let childRelatedFields: string[] = [];
        related.forEach((fieldName) => {
            let tokens = fieldName.split('.');
            if (tokens.length > 1 && tokens[0] == parent) {
                childRelatedFields.push(tokens.slice(1).join('.'));
            }
        });
        return childRelatedFields;
    }
}

/**
 * @private
 */
export async function getRelatedModelInstances(manager: IModelManager, meta: IModelMeta<any>, foreignKeyValues: IForeignKeyValues, options: IReadOptions) {

    const foreignKeyFields: string[] = [];
    const foreignKeyPKFields: string[] = [];
    const foreignKeyPromises: Array<Promise<IModelOperationResult<any, any>>> = [];

    for (let fieldName in foreignKeyValues) {
        if (foreignKeyValues[fieldName].length > 0) {
            let field = meta.fieldsByName[fieldName] as RelatedModelField;
            let relatedMeta = manager.getModelMeta(field.options.model);
            let readOptions: IReadOptions = {
                limit: foreignKeyValues[fieldName].length,
                related: getChildRelatedFieldNames(options.related, fieldName)
            };

            foreignKeyFields.push(fieldName);
            foreignKeyPKFields.push(relatedMeta.primaryKey);
            foreignKeyPromises.push(
                manager.read(
                    relatedMeta.ctor,
                    {
                        where: {
                            [relatedMeta.primaryKey]: { _in: foreignKeyValues[fieldName] }
                        },
                        ...readOptions
                    }
                ));
        }
    }

    const relatedModelInstances: IRelatedModelInstances = {};

    let results = await Promise.all(foreignKeyPromises);
    foreignKeyFields.forEach((fieldName, i) => {
        relatedModelInstances[fieldName] = {};
        for (let instance of results[i].results) {
            relatedModelInstances[fieldName][instance[foreignKeyPKFields[i]]] = instance;
        }
    });

    return relatedModelInstances;
}

/**
 * @private
 */
export async function getRelatedModelListInstances(manager: IModelManager, meta: IModelMeta<any>, primaryKeyValues: string[], options: IReadOptions) {

    const modelListFields: string[] = [];
    const modelListFieldFKs: string[] = [];
    const modelListFieldPromises: Array<Promise<IModelOperationResult<any, any>>> = [];
    const relatedFieldNames = getOwnRelatedFieldNames(options.related);

    for (let fieldName of relatedFieldNames) {
        let field = meta.fieldsByName[fieldName];
        if (field instanceof RelatedModelListField) {
            let relatedMeta = manager.getModelMeta(field.options.model);
            let readOptions: IReadOptions = {
                // NOTE: Number of results limited to the default number of results
                rawValues: [field.options.field],
                related: getChildRelatedFieldNames(options.related, fieldName)
            };
            modelListFields.push(fieldName);
            modelListFieldFKs.push(field.options.field);
            modelListFieldPromises.push(
                manager.read(
                    relatedMeta.ctor,
                    {
                        where: {
                            [field.options.field]: { _in: primaryKeyValues }
                        },
                        ...readOptions
                    }
                ));
        }
    }

    const relatedModelListInstances: IRelatedModelListInstances = {};

    let results = await Promise.all(modelListFieldPromises);
    modelListFields.forEach((fieldName, i) => {
        relatedModelListInstances[fieldName] = {};
        results[i].results.forEach((instance, resultIdx) => {
            let fkValue = results[i].meta.rawValues[resultIdx][modelListFieldFKs[i]];
            if (!relatedModelListInstances[fieldName][fkValue]) {
                relatedModelListInstances[fieldName][fkValue] = [];
            }
            relatedModelListInstances[fieldName][fkValue].push(instance);
        });
    });

    return relatedModelListInstances;
}
