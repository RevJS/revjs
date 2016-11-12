
import { IModel } from '../model';
import { IStorage } from '../storage';
import InMemoryStorage from '../storage/inmemory';

export class ModelRegistry {
    private models: {[name: string]: IModel} = {};
    private storage: {[name: string]: IStorage} = {};

    constructor() {
        this.configureStorage('default', new InMemoryStorage());
    }

    public configureStorage(name: string, storage: IStorage) {
        this.storage[name] = storage;
    }

    public addModel(name: string, instance: IModel) {
        if (this.models[name]) {
            throw new Error(`Model '${name}' is already present in this registry!`);
        }
        this.models[name] = instance;
        instance.__meta__.registry = this;
    }

    public getModel(name: string) {
        if (!this.models[name]) {
            throw new Error(`Model '${name}' does not exist in this registry!`);
        }
        return this.models[name];
    }
}

const registry = new ModelRegistry();
export default registry;
