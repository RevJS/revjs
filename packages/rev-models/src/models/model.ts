import { IModelMeta } from './meta';
import { ModelOperationResult } from '../operations/operationresult';
import { IModelOperation } from '../operations/operation';
import { IWhereQuery } from '../queries/query';
import { ICreateOptions, modelCreate } from '../operations/create';
import { IUpdateOptions, modelUpdate } from '../operations/update';
import { IRemoveOptions, modelRemove } from '../operations/remove';
import { IReadOptions, modelRead } from '../operations/read';
import { ModelValidationResult } from '../validation/validationresult';
import { IValidationOptions, modelValidate, modelValidateForRemoval } from '../operations/validate';

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
        return modelCreate(this, options);
    }

    update(where?: IWhereQuery, options?: IUpdateOptions): Promise<ModelOperationResult<this>> {
        return modelUpdate(this, where, options);
    }

    remove(where?: IWhereQuery, options?: IRemoveOptions): Promise<ModelOperationResult<this>> {
        return modelRemove(this, where, options);
    }

    read(where?: IWhereQuery, options?: IReadOptions): Promise<ModelOperationResult<this>> {
        return modelRead(this.constructor as any, where, options);
    }

    validate(operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
        return modelValidate(this, operation, options);
    }

    validateForRemoval(operation?: IModelOperation, options?: IValidationOptions): Promise<ModelValidationResult> {
        return modelValidateForRemoval(this, operation, options);
    }

}
