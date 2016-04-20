
import ValidationError from '../errors/validation';

export default class Model {
    constructor(options) {
        this.registry = null;
        this.fields = this.getFields ? this.getFields() : {}
        this.meta = this.getMeta ? this.getMeta() : {}
        
        if (!this.meta.tableName) {
            this.meta.tableName = this.constructor.name;
        }
    }
    
    validateValues(vals) {
        for (var fieldName in vals) {
            if (!(fieldName in this.fields)) {
                throw new ValidationError(fieldName, ['extraField']);
            }
            else {
                this.fields[fieldName].validateValue(vals[fieldName]);
            }
        }
    }
    
    create(createVals, options = {}) {
        if (!createVals) {
            throw new Error("create() requires the 'createVals' parameter");
        }
        if (this.meta.singleton) {
            throw new Error("create() cannot be called on singleton models");
        }
        
        this.validateValues(createVals);
        return this.registry.storage.create(this, createVals, options);
    }
    
    update(updateVals, where = null, options = {}) {
        if (!updateVals) {
            throw new Error("update() requires the 'updateVals' parameter");
        }
        if (!this.meta.singleton && !where) {
            throw new Error("update() requires the 'where' parameter for non-singleton models")
        }
        
        // TODO: Get existing vals when appropriate
        // updateVals = Object.assign(origVals, updateVals)
        
        this.validateValues(updateVals);
        return this.registry.storage.update(this, updateVals, where, options);
    }
}