
import { IStorage } from "./types";

export default class ExpressSessionStorage implements IStorage {

    constructor(options = {}) {
        // super(options);
        // this.sessionKey = options.sessionKey || "models";
    }

    /*create(model, vals, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.create() requires 'session' option to be specified.");
            }
            if (model.meta.singleton) {
                throw new Error("ExpressSessionStorage.create() cannot be called on singleton models");
            }
            if (!(this.sessionKey in options.session))
                options.session[this.sessionKey] = {};
            let modelData = options.session[this.sessionKey];
            if (!(model.meta.tableName in modelData)) {
                modelData[model.meta.tableName] = [];
            }
            throw new Error("ExpressSessionStorage.create() not yet implemented :-)");
        });
    }

    update(model, vals, where = null, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
            }
            if (!model.meta.singleton && !where) {
                throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models");
            }
            if (!(this.sessionKey in options.session))
                options.session[this.sessionKey] = {};
            let modelData = options.session[this.sessionKey];
            if (!(model.meta.tableName in modelData)) {
                if (model.meta.singleton) {
                    modelData[model.meta.tableName] = {};
                }
                else {
                    modelData[model.meta.tableName] = [];
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
                throw new Error("Non-singleton Session Storage updates not yet implemented!");
            }
        });
    }

    get(model, where = null, options = {}) {
        return new Promise((resolve) => {
            if (!options.session) {
                throw new Error("ExpressSessionStorage.update() requires 'session' option to be specified.");
            }
            if (!model.meta.singleton && !where) {
                throw new Error("ExpressSessionStorage.update() requires the 'where' parameter for non-singleton models");
            }

            if ( !(this.sessionKey in options.session)
                || !(model.meta.tableName in options.session[this.sessionKey])) {

                if (model.meta.singleton) {
                    resolve({});
                }
                else {
                    resolve([]);
                }
            }
            else {
                let modelData = options.session[this.sessionKey][model.meta.tableName];
                if (model.meta.singleton) {
                    resolve(modelData);
                }
                else {
                    throw new Error("Non-singleton Session Storage get() not yet implemented!");
                }
            }
        });
    }*/
}
