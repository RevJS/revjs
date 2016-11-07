
import ValidationError from '../errors/validation';
import { Field } from '../fields';

// NOTE: Avoid ES6 default argument value transpilation (unless you want to hide those args from APIs)

export default class Model {
    constructor(options) {
        this.registry = null;
        this.fields = {}
    }

    addFields(fieldsObj) {
        if (typeof fieldsObj != 'object')
            throw new TypeError('fieldsObj must be an object');
        for (var field in fieldsObj) {
            if (!(fieldsObj[field] instanceof Field))
                throw new TypeError('fieldsObj["'+field+'"] is not an instance of Field');
        }
        Object.assign(this.fields, fieldsObj);
    }

    validateValues(vals, checkAllValidators = true) {
        if (typeof vals != 'object')
            throw new TypeError('vals must be an object');
        for (var fieldName in vals) {
            if (!(fieldName in this.fields)) {
                throw new ValidationError(fieldName, ['extraField']);
            }
            else {
                this.fields[fieldName].validateValue(vals[fieldName]);
            }
        }
    }
    
    create(vals, options) {
        options = options || {};
        if (!vals)
            throw new Error("create() requires the 'vals' parameter");
        if (typeof vals != 'object')
            throw new TypeError('vals must be an object');
        if (this.meta.singleton)
            throw new Error("create() cannot be called on singleton models");
        
        this.validateValues(vals);
        return this.registry.storage.create(this, vals, options);
    }
    
    update(vals, where, options) {
        where = where || null;
        options = options || {};
        if (!vals)
            throw new Error("update() requires the 'vals' parameter");
        if (typeof vals != 'object')
            throw new TypeError('vals must be an object');
        if (!this.meta.singleton && !where)
            throw new Error("update() requires the 'where' parameter for non-singleton models")
        
        // TODO: Get existing vals when appropriate
        // vals = Object.assign(origVals, vals)
        
        this.validateValues(vals);
        return this.registry.storage.update(this, vals, where, options);
    }
    
    get(where, options) {
        options = options || {};
        if (!this.meta.singleton && !where) {
            throw new Error("get() requires the 'where' parameter for non-singleton models");
        }
        return this.registry.storage.get(this, where, options);
    }
}