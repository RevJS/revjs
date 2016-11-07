
export default class ModelRegistry {
    constructor(storage, options = {}) {
        if (!storage) {
            throw new Error('ModelRegistry must be constructed with a ModelStorage instance as the first parameter')
        }
        this.storage = storage;
        this.models = {};
    }
    
    addModel(name, instance) {
        if (this.models[name]) {
            throw new Error(`Model '${name}' is already present in this registry!`);
        }
        instance.register(name, this);
        this.models[name] = instance;
    }
    
    getModel(name) {
        if (!this.models[name]) {
            throw new Error(`Model '${name}' does not exist in this registry!`);
        }
        return this.models[name];
    }
}
