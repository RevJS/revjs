"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var meta_1 = require("../models/meta");
var models_1 = require("../models");
var ModelRegistry = (function () {
    function ModelRegistry() {
        this._modelProto = {};
        this._modelMeta = {};
    }
    // TODO: Support extending existing models
    ModelRegistry.prototype.isRegistered = function (modelName) {
        return (modelName in this._modelProto);
    };
    ModelRegistry.prototype.register = function (model, meta) {
        // Check model constructor
        models_1.checkIsModelConstructor(model);
        var modelName = model.name;
        if (this.isRegistered(modelName)) {
            throw new Error("RegistryError: Model '" + modelName + "' already exists in the registry.");
        }
        // Initialise model metadata
        meta = meta_1.initialiseMeta(model, meta);
        // Add prototype and metadata to the registry
        this._modelProto[modelName] = model;
        this._modelMeta[modelName] = meta;
    };
    ModelRegistry.prototype.getModelNames = function () {
        return Object.keys(this._modelMeta);
    };
    ModelRegistry.prototype.getProto = function (modelName) {
        if (!this.isRegistered(modelName)) {
            throw new Error("RegistryError: Model  '" + modelName + "' does not exist in the registry.");
        }
        return this._modelProto[modelName];
    };
    ModelRegistry.prototype.getMeta = function (modelName) {
        if (!this.isRegistered(modelName)) {
            throw new Error("RegistryError: Model  '" + modelName + "' does not exist in the registry.");
        }
        return this._modelMeta[modelName];
    };
    ModelRegistry.prototype.clearRegistry = function () {
        this._modelProto = {};
        this._modelMeta = {};
    };
    return ModelRegistry;
}());
exports.ModelRegistry = ModelRegistry;
exports.registry = new ModelRegistry();
function register(model, meta) {
    exports.registry.register(model, meta);
}
exports.register = register;
