// Required once to enable the Reflect API to be used
import 'babel-polyfill';

import { assert } from 'chai';
import {
    Field,
    StringField,
    PasswordField,
    NumberField,
    IntegerField,
    FloatField,
    DecimalField,
    DateField
} from '../index';
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

    describe("StringField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new StringField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new StringField("My Field");
            });
        });
        describe("validateValue()", () => {
            it("throws a ValidationError when value.length < minLength", () => {
                var f = new StringField("My Field", {minLength: 2});
                assert.throws(() => { f.validateValue("a"); }, ValidationError);
            });
            it("returns true when value.length >= minLength", () => {
                var f = new StringField("My Field", {minLength: 2});
                assert.equal(f.validateValue("aa"), true);
                assert.equal(f.validateValue("abc123"), true);
            });
            it("returns true when value.length <= maxLength", () => {
                var f = new StringField("My Field", {maxLength: 6});
                assert.equal(f.validateValue("abc"), true);
                assert.equal(f.validateValue("abc123"), true);
            });
            it("throws a ValidationError when value.length > maxLength", () => {
                var f = new StringField("My Field", {maxLength: 2});
                assert.throws(() => { f.validateValue("abc123"); }, ValidationError);
            });
            it("ValidationError contains only one error when checkAllValidators = false", () => {
                var f = new StringField("My Field", {maxLength: 2, minLength: 4});
                try {
                    f.validateValue("abc", false);
                }
                catch (e) {
                    assert.instanceOf(e, ValidationError);
                    assert.equal(e.failedValidators.length, 1);
                    return;
                }
                assert(false, "No exception returned");
            });
            it("ValidationError contains more than one error when checkAllValidators = true", () => {
                var f = new StringField("My Field", {maxLength: 2, minLength: 4});
                try {
                    f.validateValue("abc", true);
                }
                catch (e) {
                    assert.instanceOf(e, ValidationError);
                    assert(e.failedValidators.length > 1);
                    return;
                }
                assert(false, "No exception returned");
            });
        });
    });

    describe("PasswordField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new PasswordField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new PasswordField("My Field");
            });
        });
    });

    describe("NumberField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new NumberField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new NumberField("My Field");
            });
        });
        describe("validateValue()", () => {
            it("returns true when value is a number", () => {
                var f = new NumberField("My Field");
                assert.equal(f.validateValue(123.12), true);
                assert.equal(f.validateValue("10"), true);
            });
            it("throws a ValidationError when value is not a number", () => {
                var f = new NumberField("My Field", {minLength: 2});
                assert.throws(() => { f.validateValue("abc"); }, ValidationError);
            });
            it("throws a ValidationError when value < minValue", () => {
                var f = new NumberField("My Field", {minValue: 10});
                assert.throws(() => { f.validateValue("5"); }, ValidationError);
                assert.throws(() => { f.validateValue(5); }, ValidationError);
            });
            it("returns true when value >= minValue", () => {
                var f = new NumberField("My Field", {minValue: 2});
                assert.equal(f.validateValue("3"), true);
                assert.equal(f.validateValue(3), true);
            });
            it("returns true when value <= maxValue", () => {
                var f = new NumberField("My Field", {maxValue: 6});
                assert.equal(f.validateValue("4"), true);
                assert.equal(f.validateValue(4), true);
            });
            it("throws a ValidationError when value > maxValuh", () => {
                var f = new NumberField("My Field", {maxValue: 2});
                assert.throws(() => { f.validateValue("5"); }, ValidationError);
                assert.throws(() => { f.validateValue(5); }, ValidationError);
            });
        });
    });

    describe("IntegerField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new IntegerField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new IntegerField("My Field");
            });
        });
        describe("validateValue()", () => {
            it("returns true when value is an integer", () => {
                var f = new IntegerField("My Field");
                assert.equal(f.validateValue(123), true);
                assert.equal(f.validateValue("10"), true);
            });
            it("throws a ValidationError when value is not an integer", () => {
                var f = new IntegerField("My Field", {minLength: 2});
                assert.throws(() => { f.validateValue("123.1"); }, ValidationError);
                assert.throws(() => { f.validateValue(22.33); }, ValidationError);
            });
        });
    });

    describe("FloatField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new FloatField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new FloatField("My Field");
            });
        });
    });

    describe("DecimalField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new DecimalField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new DecimalField("My Field");
            });
        });
    });

    describe("DateField class", () => {
        it("can't be created without a label", () => {
            assert.throws(() => {
                new DateField();
            });
        });
        it("can be created with a label", () => {
            assert.doesNotThrow(() => {
                new DateField("My Field");
            });
        });
    });
});