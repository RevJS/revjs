
import { IModel, IModelMeta, IModelManager, IReadOptions, IReadMeta } from '../models/types';
import { ModelOperationResult } from './operationresult';
import { IModelOperation } from './operation';
import { RelatedModelFieldBase } from '../fields/relatedfields';

export const DEFAULT_READ_OPTIONS: IReadOptions = {
    where: {},
    limit: 20,
    offset: 0
};

export async function read<T extends IModel>(manager: IModelManager, model: new() => T, options?: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {

    let meta = manager.getModelMeta(model) as IModelMeta<T>;
    if (options) {
        if (typeof options.limit != 'undefined' && options.limit < 1) {
            throw new Error('read(): options.limit cannot be less than 1');
        }
        if (typeof options.offset != 'undefined' && options.offset < 0) {
            throw new Error('read(): options.offset cannot be less than zero');
        }
        if (options.related) {
            validateRelated(model, meta, options.related);
        }
        if (options.orderBy) {
            validateOrderBy(model, meta, options.orderBy);
        }
    }

    let backend = manager.getBackend(meta.backend);
    let opts = Object.assign({}, DEFAULT_READ_OPTIONS, options);

    let operation: IModelOperation = {
        operationName: 'read',
        where: opts.where
    };
    let operationResult = new ModelOperationResult<T, IReadMeta>(operation);
    return backend.read(manager, model, opts, operationResult);

}

export function validateRelated<T extends IModel>(model: new() => T, meta: IModelMeta<T>, related: any) {

    if (typeof related != 'object'
            || !(related instanceof Array)) {
        throw new Error('read(): related: must be an array');
    }

    for (let related_field of related) {
        if (typeof related_field != 'string') {
            throw new Error('read(): related: array contains a non-string value');
        }
        let fieldName = related_field.split('.')[0];
        if (!(fieldName in meta.fieldsByName)) {
            throw new Error(`read(): related: field '${related_field}' does not exist in model '${meta.name}'`);
        }
        if (!(meta.fieldsByName[fieldName] instanceof RelatedModelFieldBase)) {
            throw new Error(`read(): related: field '${related_field}' is not a relational field in model '${meta.name}'`);
        }
    }
}

export function validateOrderBy<T extends IModel>(model: new() => T, meta: IModelMeta<T>, orderBy: any) {

    if (typeof orderBy != 'object'
            || !(orderBy instanceof Array)
            || orderBy.length == 0) {
        throw new Error('read(): orderBy: must be an array with at least one item');
    }

    for (let ob_entry of orderBy) {
        if (typeof ob_entry != 'string') {
            throw new Error('read(): orderBy: array contains a non-string value');
        }
        let ob_tokens = ob_entry.split(' ');
        if (ob_tokens.length > 2
            || (ob_tokens.length == 2 && ['asc', 'desc'].indexOf(ob_tokens[1]) == -1)) {
            throw new Error(`read(): orderBy: invalid entry '${ob_entry}'`);
        }
        if (!(ob_tokens[0] in meta.fieldsByName)) {
            throw new Error(`read(): orderBy: field '${ob_tokens[0]}' does not exist in model`);
        }
    }
}
