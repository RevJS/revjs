import { assert } from 'chai';
import { getFuncArgNames } from '../utils';

describe('utils', () => {

    describe('getFuncArgNames()', () => {

        it("shouldn't break when arg is not a function", () => {
            var testFunc = 'abc123';
            assert.deepEqual(
                getFuncArgNames(testFunc),
                []
            );
        });

        it("shouldn't break when function has no args", () => {
            var testFunc = function() {};
            assert.deepEqual(
                getFuncArgNames(testFunc),
                []
            );
        });

        it("should return arg names", () => {
            var testFunc = function(arg1, arg2, arg3) {};
            assert.deepEqual(
                getFuncArgNames(testFunc),
                ['arg1','arg2','arg3']
            );
        });

    });

});