
import { IStorage } from './';
import { IModel, ICreateOptions, IReadOptions, IUpdateOptions, IRemoveOptions } from '../model';

export default class InMemoryStorage implements IStorage {
    private storage: {
        [modelName: string]: any
    } = {};

    constructor(options: any = {}) {
        // TODO: Do Stuff...
    }

    public create<T extends IModel>(model: IModel, options?: ICreateOptions): Promise<T> {
        return new Promise((resolve) => {
            if (model.__meta__.singleton) {
                throw new Error('InMemoryStorage.create() cannot be called on singleton models');
            }
            else {
                throw new Error('InMemoryStorage.create() not yet implemented');
            }
            // TODO...
            // let modelData = this.getModelData(model);
            // modelData.push(vals);
        });
    }

    public update<T extends IModel>(model: IModel, where?: any, options?: IUpdateOptions): Promise<boolean> {
        return new Promise((resolve) => {
            if (!model.__meta__.singleton && !where) {
                throw new Error('InMemoryStorage.update() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this.getModelData(model);
            if (model.__meta__.singleton) {
                this.writeFields(model, modelData);
                resolve(true);
            }
            else {
                throw new Error('InMemoryStorage.update() not yet implemented for non-singleton models');
            }
        });
    }

    public read<T extends IModel>(model: IModel, where?: any, options?: IReadOptions): Promise<Array<T>> {
        return new Promise((resolve) => {
            if (!model.__meta__.singleton && !where) {
                throw new Error('InMemoryStorage.read() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this.getModelData(model, false);
            if (!modelData) {
                resolve(model.__meta__.singleton ? {} : []);
            }
            else {
                if (model.__meta__.singleton) {
                    resolve(modelData);
                }
                else {
                    throw new Error('InMemoryStorage.read() not yet implemented for non-singleton models');
                }
            }
        });
    };

    public remove<T extends IModel>(model: IModel, where: any, options?: IRemoveOptions): Promise<boolean> {
        throw new Error('InMemoryStorage.delete() not yet implemented');
    }

    private getModelData(model: IModel, init = true): any {
        if (!this.storage[model.__meta__.name] && init) {
            if (model.__meta__.singleton) {
                this.storage[model.__meta__.name] = {};
            }
            else {
                this.storage[model.__meta__.name] = [];
            }
        }
        return this.storage[model.__meta__.name];
    }

    private writeFields(model: IModel, target: any): void {
        for (let field in model.__meta__.fields) {
            target[field] = model[field];
        }
    }
}
