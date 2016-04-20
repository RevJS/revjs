
import ModelStorage from './storage';

export default class ExpressSessionStorage extends ModelStorage {
    
    create(model, createVals, options) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.create() requires 'session' option to be specified.");
            }
            if (model.meta.singleton) {
                throw new Error("ExpressSessionStorage.create() cannot be called on singleton models");
            }
            if (!options.session[model.meta.tableName]) {
                session[model.meta.tableName] = []
            }
            resolve(true);
        });        
    }
    
    update(model, updateVals, where = null, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
            }
            if (!model.meta.singleton && !where) {
                throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models")
            }
            if (!options.session[model.meta.tableName]) {
                if (model.meta.singleton) {
                    options.session[model.meta.tableName] = {}
                }
                else {
                    options.session[model.meta.tableName] = []
                }
            }
            if (model.meta.singleton) {
                options.session[model.meta.tableName] = Object.assign(
                    options.session[model.meta.tableName],
                    updateVals
                );
                resolve(true);
            }
            else {
                throw new Error('Non-singleton Session Storage updates not yet implemented!');
            }
        });
    }
}