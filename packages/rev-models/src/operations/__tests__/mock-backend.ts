
import * as sinon from 'sinon';
import { IBackend } from '../../backends/backends';
import { ModelOperationResult } from '../operationresult';
import { Model } from '../../models/model';
import { ICreateOptions } from '../create';
import { IUpdateOptions } from '../update';
import { IRemoveOptions } from '../remove';
import { IReadOptions } from '../read';

export class MockBackend implements IBackend {
    createStub = sinon.stub();
    updateStub = sinon.stub();
    removeStub = sinon.stub();
    readStub = sinon.stub();

    errorsToAdd: string[] = [];
    errorToThrow: Error = null;
    results: any[] = null;

    create<T extends Model>(model: T, result: ModelOperationResult<T>, options: ICreateOptions): Promise<ModelOperationResult<T>> {
        this.addErrors(result);
        this.createStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    update<T extends Model>(model: T, where: object, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<ModelOperationResult<T>> {
        this.addErrors(result);
        this.updateStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    remove<T extends Model>(model: new() => T, where: object, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<ModelOperationResult<T>> {
        this.addErrors(result);
        this.removeStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    read<T extends Model>(model: new() => T, where: object, result: ModelOperationResult<T>, options: IReadOptions): Promise<ModelOperationResult<T>> {
        result.results = this.results;
        this.addErrors(result);
        this.readStub.apply(null, arguments);
        return this.getReturnValue(result);
    }

    private addErrors(result: ModelOperationResult<any>) {
        for (let error of this.errorsToAdd) {
            result.addError(error);
        }
    }

    private getReturnValue(result: ModelOperationResult<any>) {
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
