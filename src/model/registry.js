
export default class ModelRegistry {
    constructor() {
        this.models = {};
    }
    
    addModel(name, instance) {
        if (this.models[name]) {
            throw new Error(`Model '${name}' is already present in this registry!`);
        }
        this.models[name] = instance;
    }
    
    getModel(name) {
        if (!this.models[name]) {
            throw new Error(`Model '${name}' does not exist in this registry!`);
        }
    }
}
