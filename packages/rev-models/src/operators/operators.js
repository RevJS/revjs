"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operatortypes_1 = require("./operatortypes");
// Based on operators from the MongoDB Query Documents
// https://docs.mongodb.com/manual/reference/operator/query/
exports.OPERATORS = {
    $gt: new operatortypes_1.ValueOperator(),
    $gte: new operatortypes_1.ValueOperator(),
    $lt: new operatortypes_1.ValueOperator(),
    $lte: new operatortypes_1.ValueOperator(),
    $ne: new operatortypes_1.ValueOperator(),
    $in: new operatortypes_1.ValueListOperator(),
    $nin: new operatortypes_1.ValueListOperator(),
    $exists: new operatortypes_1.ValueListOperator(),
    $and: new operatortypes_1.ConjunctionOperator(),
    $or: new operatortypes_1.ConjunctionOperator()
};
