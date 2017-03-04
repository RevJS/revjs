"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("../fields/field");
function initialiseMeta(model, meta) {
    var modelName = model.name;
    // Load fields from prototype __fields property if present (fields added via decorators)
    var proto = model.prototype;
    if (proto.__fields) {
        if (typeof proto.__fields != 'object' || !(proto.__fields instanceof Array)) {
            throw new Error('MetadataError: Model __fields property must be an array.');
        }
        if (!meta) {
            meta = { fields: [] };
        }
        if (!meta.fields) {
            meta.fields = [];
        }
        if (!(meta.fields instanceof Array)) {
            throw new Error('MetadataError: Model metadata fields entry must be an array.');
        }
        for (var _i = 0, _a = proto.__fields; _i < _a.length; _i++) {
            var field = _a[_i];
            meta.fields.push(field);
        }
        delete proto.__fields;
    }
    // Check metadata
    if (!meta || !meta.fields || !(meta.fields instanceof Array)) {
        throw new Error('MetadataError: You must define the fields metadata for the model.');
    }
    for (var _b = 0, _c = meta.fields; _b < _c.length; _b++) {
        var field = _c[_b];
        if (!field || typeof field != 'object' || !(field instanceof field_1.Field)) {
            throw new Error("MetadataError: One or more entries in the fields metadata is not an instance of rev.Field.");
        }
    }
    // Populate default metadata
    if (meta.name) {
        if (modelName != meta.name) {
            throw new Error('MetadataError: Model name does not match meta.name. To register the model under a different name you should rename its constructor.');
        }
    }
    else {
        meta.name = modelName;
    }
    meta.fieldsByName = {};
    for (var _d = 0, _e = meta.fields; _d < _e.length; _d++) {
        var field = _e[_d];
        if (field.name in meta.fieldsByName) {
            throw new Error("MetadataError: Field \"" + field.name + "\" is defined more than once.");
        }
        meta.fieldsByName[field.name] = field;
    }
    meta.storage = meta.storage ? meta.storage : 'default';
    meta.label = meta.label ? meta.label : meta.name;
    meta.singleton = meta.singleton ? true : false;
    return meta;
}
exports.initialiseMeta = initialiseMeta;
