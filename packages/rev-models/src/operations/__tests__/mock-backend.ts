
import * as sinon from 'sinon';
import { IBackend } from '../../backends/backend';
import { ModelRegistry } from '../../registry/registry';
import { ModelOperationResult } from '../operationresult';
import { Model } from '../../models/model';
import { ICreateOptions, ICreateMeta } from '../create';
import { IUpdateOptions, IUpdateMeta } from '../update';
import { IRemoveOptions, IRemoveMeta } from '../remove';
import { IReadOptions, IReadMeta } from '../read';

export class MockBackend implements IBackend {
    createStub = sinon.stub();
    updateStub = sinon.stub();
    removeStub = sinon.stub();
    readStub = sinon.stub();

    errorsToAdd: string[] = [];
    errorToThrow: Error = null;
    results: any[] = null;

    create<T extends Model>(registry: ModelRegistry, model: T, result: ModelOperationResult<T, ICreateMeta>, options: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
        this.addErrors(result);
        this.createStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    update<T extends Model>(registry: ModelRegistry, model: T, where: object, result: ModelOperationResult<T, IUpdateMeta>, options: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
        this.addErrors(result);
        this.updateStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    remove<T extends Model>(registry: ModelRegistry, model: new() => T, where: object, result: ModelOperationResult<T, IRemoveMeta>, options: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
        this.addErrors(result);
        this.removeStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    read<T extends Model>(registry: ModelRegistry, model: new() => T, where: object, result: ModelOperationResult<T, IReadMeta>, options: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
        result.results = this.results;
        this.addErrors(result);
        this.readStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    private addErrors(result: ModelOperationResult<any, any>) {
        for (let error of this.errorsToAdd) {
            result.addError(error);
        }
    }

    private getReturnValue(result: ModelOperationResult<any, any>) {
        if (this.errorToThrow) {
            return Promise.reject(this.errorToThrow);
        }
        else if (result.success) {
            return Promise.resolve(result);
        }
        else {
            let operationError = new Error('BackendFailure');
            operationError.result = result;
            return Promise.reject(operationError);
        }
    }
}
