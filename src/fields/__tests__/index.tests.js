// Required once to enable the Reflect API to be used
import 'babel-polyfill';

import { assert } from 'chai';
import { Field } from '../index';
import ValidationError from '../../errors/validation';

describe("fields", () => {

    describe("Field class", () => {

        it("can't be created without a label", () => {
            assert.throws(() => {
                new Field();
            });
        });

        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new Field("My Field");
            });
        });

        describe("validateValue()", () => {

            it("returns true for any value when not required", () => {
                var f = new Field("My Field", {required: false});
                assert.equal(f.validateValue(null), true);
                assert.equal(f.validateValue(""), true);
                assert.equal(f.validateValue("abc"), true);
                assert.equal(f.validateValue(1), true);
            });

            it("returns true for non-empty values when required", () => {
                var f = new Field("My Field", {required: true});
                assert.equal(f.validateValue("abc"), true);
                assert.equal(f.validateValue(1), true);
            });

            it("throws a ValidationError for empty values when required", () => {
                var f = new Field("My Field", {required: true});
                assert.throws(() => { f.validateValue(null); }, ValidationError);
                assert.throws(() => { f.validateValue("");   }, ValidationError);
            });

        });

    });

});