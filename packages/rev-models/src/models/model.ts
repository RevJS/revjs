import { IModelMeta } from './meta';
import { ModelOperationResult } from '../operations/operationresult';
import { IModelOperation } from '../operations/operation';
import { IWhereQuery } from '../queries/query';
import { ICreateOptions, create } from '../operations/create';
import { IUpdateOptions, update } from '../operations/update';
import { IRemoveOptions, remove } from '../operations/remove';
import { IReadOptions, read } from '../operations/read';
import { ModelValidationResult } from '../validation/validationresult';
import { IValidationOptions, validate } from '../operations/validate';

export interface IModelOptions {
    singleton?: boolean;
    backend?: string;
}

export interface IModelData {
    [fieldName: string]: any;
}

export class Model {
    static meta: IModelMeta;

    constructor(data?: IModelData) {
        if (this.constructor == Model) {
            throw new Error('ModelError: You should not instantiate the Model class directly');
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error('ModelError: initial data must be an object');
            }
            Object.assign(this, data);
        }
    }

    getMeta(): IModelMeta {
        return this.constructor['meta'];
    }

    create(options?: ICreateOptions): Promise<ModelOperationResult<this>> {
        return create(this, options);
    }

    update(where?: IWhereQuery, options?: IUpdateOptions): Promise<ModelOperationResult<this>> {
        return update(this, where, options);
    }

    remove(where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<this>> {
        return remove(this, where, options);
    }

    read(where?: IWhereQuery, options?: IReadOptions): Promise<ModelOperationResult<this>> {
        return read(this.constructor as any, where, options);
    }

    validate(operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
        return validate(this, operation, options);
    }

}
