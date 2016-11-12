
import { IStorage } from "../storage/types";

export default class ModelRegistry {
    private models: {[name: string]: any} = {};

    constructor(private storage: IStorage, options = {}) {
        if (!storage) {
            throw new Error("ModelRegistry must be constructed with a ModelStorage instance as the first parameter");
        }
    }

    public addModel(name: string, instance: any) {
        if (this.models[name]) {
            throw new Error(`Model '${name}' is already present in this registry!`);
        }
        instance.register(name, this);
        this.models[name] = instance;
    }

    public getModel(name: string) {
        if (!this.models[name]) {
            throw new Error(`Model '${name}' does not exist in this registry!`);
        }
        return this.models[name];
    }
}
