
import * as sinon from 'sinon';
import { IBackend } from '../../backends/backends';
import { ModelOperationResult } from '../operationresult';
import { Model } from '../../models/model';
import { IWhereQuery } from '../../queries/query';
import { ICreateOptions } from '../create';
import { IUpdateOptions } from '../update';
import { IRemoveOptions } from '../remove';
import { IReadOptions } from '../read';

export class MockBackend implements IBackend {
    createStub = sinon.stub().returns(Promise.resolve());
    updateStub = sinon.stub().returns(Promise.resolve());
    removeStub = sinon.stub().returns(Promise.resolve());
    readStub = sinon.stub().returns(Promise.resolve());

    create<T extends Model>(model: T, result: ModelOperationResult<T>, options: ICreateOptions): Promise<void> {
        return this.createStub.apply(null, arguments);
    }

    update<T extends Model>(model: T, where: IWhereQuery, result: ModelOperationResult<T>, options: IUpdateOptions): Promise<void> {
        return this.updateStub.apply(null, arguments);
    }

    remove<T extends Model>(model: T, where: IWhereQuery, result: ModelOperationResult<T>, options: IRemoveOptions): Promise<void> {
        return this.removeStub.apply(null, arguments);
    }

    read<T extends Model>(model: new() => T, where: IWhereQuery, result: ModelOperationResult<T>, options: IReadOptions): Promise<void> {
        return this.readStub.apply(null, arguments);
    }
}
