"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkIsModelInstance(model) {
    if (!model || typeof model != 'object' || !model.constructor) {
        throw new Error('ModelError: Supplied model is not a model instance.');
    }
}
exports.checkIsModelInstance = checkIsModelInstance;
function checkIsModelConstructor(model) {
    if (!model || typeof model != 'function' || !model.name) {
        throw new Error('ModelError: Supplied model is not a model constructor.');
    }
}
exports.checkIsModelConstructor = checkIsModelConstructor;
function checkMetadataInitialised(meta) {
    if (!meta || typeof meta != 'object') {
        throw new Error('MetadataError: Supplied metadata is not an object.');
    }
    if (!meta.fields || typeof meta.fields != 'object' || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: Supplied metadata does not contain fields array.');
    }
    if (!meta.fieldsByName || typeof meta.fieldsByName != 'object') {
        throw new Error('MetadataError: Supplied metadata has not been initialised.');
    }
}
exports.checkMetadataInitialised = checkMetadataInitialised;
