
import * as sinon from 'sinon';
import { IBackend } from '../../backends/backend';
import { ModelManager } from '../../models/manager';
import { ModelOperationResult } from '../operationresult';
import {
    IModel, ICreateMeta, ICreateOptions, IUpdateMeta, IUpdateOptions,
    IRemoveMeta, IRemoveOptions, IReadMeta, IReadOptions,
    IExecMeta, IExecOptions
} from '../../models/types';

export class MockBackend implements IBackend {
    createStub = sinon.stub();
    updateStub = sinon.stub();
    removeStub = sinon.stub();
    readStub = sinon.stub();
    execStub = sinon.stub();

    errorsToAdd: string[] = [];
    errorToThrow: Error = null;
    results: any[] = null;

    create<T extends IModel>(manager: ModelManager, model: T, options: ICreateOptions, result: ModelOperationResult<T, ICreateMeta>): Promise<ModelOperationResult<T, ICreateMeta>> {
        this.addErrors(result);
        this.createStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    update<T extends IModel>(manager: ModelManager, model: T, options: IUpdateOptions, result: ModelOperationResult<T, IUpdateMeta>): Promise<ModelOperationResult<T, IUpdateMeta>> {
        this.addErrors(result);
        this.updateStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    remove<T extends IModel>(manager: ModelManager, model: T, options: IRemoveOptions, result: ModelOperationResult<T, IRemoveMeta>): Promise<ModelOperationResult<T, IRemoveMeta>> {
        this.addErrors(result);
        this.removeStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    read<T extends IModel>(manager: ModelManager, model: new() => T, options: IReadOptions, result: ModelOperationResult<T, IReadMeta>): Promise<ModelOperationResult<T, IReadMeta>> {
        result.results = this.results;
        this.addErrors(result);
        this.readStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    exec<R>(manager: ModelManager, model: IModel, options: IExecOptions, result: ModelOperationResult<R, IExecMeta>): Promise<ModelOperationResult<R, IExecMeta>> {
        this.addErrors(result);
        this.execStub.apply(null, arguments);
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
