'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFuncArgNames = getFuncArgNames;
function getFuncArgNames(func) {
    // Source: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) result = [];
    return result;
}
//# sourceMappingURL=utils.js.map
