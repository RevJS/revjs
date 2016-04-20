
import ModelStorage from './storage';

export default class ExpressSessionStorage extends ModelStorage {
    
    constructor(options = {}) {
        super(options);
        this.sessionKey = options.sessionKey || 'models';
    }
    
    create(model, vals, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.create() requires 'session' option to be specified.");
            }
            if (model.meta.singleton) {
                throw new Error("ExpressSessionStorage.create() cannot be called on singleton models");
            }
            if (!(this.sessionKey in options.session))
                options.session[this.sessionKey] = {};
            var modelData = options.session[this.sessionKey];
            if (!(model.meta.tableName in modelData)) {
                modelData[model.meta.tableName] = []
            }
            resolve(true);
        });        
    }
    
    update(model, vals, where = null, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
            }
            if (!model.meta.singleton && !where) {
                throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models")
            }
            if (!(this.sessionKey in options.session))
                options.session[this.sessionKey] = {};
            var modelData = options.session[this.sessionKey];
            if (!(model.meta.tableName in modelData)) {
                if (model.meta.singleton) {
                    modelData[model.meta.tableName] = {}
                }
                else {
                    modelData[model.meta.tableName] = []
                }
            }
            if (model.meta.singleton) {
                modelData[model.meta.tableName] = Object.assign(
                    modelData[model.meta.tableName],
                    vals
                );
                resolve(true);
            }
            else {
                throw new Error('Non-singleton Session Storage updates not yet implemented!');
            }
        });
    }
}