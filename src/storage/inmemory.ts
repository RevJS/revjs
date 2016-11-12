
import { IStorage } from './';
import { IModel } from '../model';

export default class InMemoryStorage implements IStorage {
    private storage: {
        [modelName: string]: any
    } = {};

    constructor(options: any = {}) {
        // TODO: Do Stuff...
    }

    public create(model: IModel, vals: any, options: any): Promise<any> {
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

    public update(model: IModel, vals: any, where: any = null, options = {}): Promise<any> {
        return new Promise((resolve) => {
            if (!model.__meta__.singleton && !where) {
                throw new Error('InMemoryStorage.update() requires the \'where\' parameter for non-singleton models');
            }
            let modelData = this.getModelData(model);
            if (model.__meta__.singleton) {
                modelData = Object.assign(
                    modelData,
                    vals
                );
                resolve(true);
            }
            else {
                throw new Error('InMemoryStorage.update() not yet implemented for non-singleton models');
            }
        });
    }

    public get(model: IModel, where: any = null, options = {}): Promise<any> {
        return new Promise((resolve) => {
            if (!model.__meta__.singleton && !where) {
                throw new Error('InMemoryStorage.get() requires the \'where\' parameter for non-singleton models');
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
                    throw new Error('InMemoryStorage.get() not yet implemented for non-singleton models');
                }
            }
        });
    };

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
}
