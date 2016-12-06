import { expect } from 'chai';
import * as fld from '../index';
import * as vld from '../validators';

import { ModelValidationResult } from '../../model/validationresult';

describe('rev.fields', () => {

    describe('Field - constructor()', () => {

        it('creates a field with properties as expected', () => {
            let opts: fld.IFieldOptions = {
                required: true,
                maxLength: 100
            };
            let test = new fld.Field('name', 'Name', opts);
            expect(test.name).to.equal('name');
            expect(test.label).to.equal('Name');
            expect(test.options).to.equal(opts);
        });

        it('cannot be created without a name', () => {
            expect(() => {
                let test = new fld.Field(undefined, undefined);
            }).to.throw('new fields must have a name');
        });

        it('cannot be created without a label', () => {
            expect(() => {
                let test = new fld.Field('name', undefined);
            }).to.throw('new fields must have a label');
        });

        it('sets default field options if they are not specified', () => {
            let test = new fld.Field('name', 'Name');
            expect(test.options).to.deep.equal(fld.DEFAULT_FIELD_OPTIONS);
        });

        it('throws an error if options is not an object', () => {
            expect(() => {
                let test = new fld.Field('name', 'Name', () => '33');
            }).to.throw('the options parameter must be an object');
        });

        it('sets options.required to true if it has not been specified', () => {
            let test = new fld.Field('name', 'Name', { maxLength: 20 });
            expect(test.options.required).to.equal(true);
        });

        it('adds the REQUIRED validator by default', () => {
            let test = new fld.Field('name', 'Name');
            expect(test.validators[0]).to.equal(vld.requiredValidator);
        });

/*        it('can be created with a name', () => {
            assert.doesNotThrow(() => {
                new Field('My Field');
            });
        });
        describe('validateValue()', () => {
            it('returns true for any value when not required', () => {
                let f = new Field('My Field', {required: false});
                assert.equal(f.validateValue(null).valid, true);
                assert.equal(f.validateValue('').valid, true);
                assert.equal(f.validateValue('abc').valid, true);
                assert.equal(f.validateValue(1).valid, true);
            });
            it('returns true for non-empty values when required', () => {
                let f = new Field('My Field', {required: true});
                assert.equal(f.validateValue('abc').valid, true);
                assert.equal(f.validateValue(1).valid, true);
            });
            it('returns false for empty values when required', () => {
                let f = new Field('My Field', {required: true});
                assert.equal(f.validateValue(null).valid, false);
                assert.equal(f.validateValue('').valid, false);
            });
        });
    });

    describe('TextField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new TextField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new TextField('My Field');
            });
        });
        describe('validateValue()', () => {
            it('returns false when value.length < minLength', () => {
                let f = new TextField('My Field', {minLength: 2});
                assert.equal(f.validateValue('a').valid, false);
            });
            it('returns true when value.length >= minLength', () => {
                let f = new TextField('My Field', {minLength: 2});
                assert.equal(f.validateValue('aa').valid, true);
                assert.equal(f.validateValue('abc123').valid, true);
            });
            it('returns true when value.length <= maxLength', () => {
                let f = new TextField('My Field', {maxLength: 6});
                assert.equal(f.validateValue('abc').valid, true);
                assert.equal(f.validateValue('abc123').valid, true);
            });
            it('returns false when value.length > maxLength', () => {
                let f = new TextField('My Field', {maxLength: 2});
                assert.equal(f.validateValue('abc123').valid, false);
            });
            it('ValidationResult contains only one error when checkAllValidators = false', () => {
                let f = new TextField('My Field', {maxLength: 2, minLength: 4});
                let res = f.validateValue('abc', false);
                assert.instanceOf(res, ValidationResult);
                assert.equal(res.failedValidators.length, 1);
            });
            it('ValidationResult contains more than one error when checkAllValidators = true', () => {
                let f = new TextField('My Field', {maxLength: 2, minLength: 4});
                let res = f.validateValue('abc', true);
                assert.instanceOf(res, ValidationResult);
                assert(res.failedValidators.length > 1);
            });
        });
    });

    describe('PasswordField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new PasswordField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new PasswordField('My Field');
            });
        });
    });

    describe('NumberField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new NumberField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new NumberField('My Field');
            });
        });
        describe('validateValue()', () => {
            it('returns true when value is a number', () => {
                let f = new NumberField('My Field');
                assert.equal(f.validateValue(123.12).valid, true);
                assert.equal(f.validateValue('10').valid, true);
            });
            it('returns false when value is not a number', () => {
                let f = new NumberField('My Field', {minLength: 2});
                assert.equal(f.validateValue('abc').valid, false);
            });
            it('returns false when value < minValue', () => {
                let f = new NumberField('My Field', {minValue: 10});
                assert.equal(f.validateValue('5').valid, false);
                assert.equal(f.validateValue(5).valid, false);
            });
            it('returns true when value >= minValue', () => {
                let f = new NumberField('My Field', {minValue: 2});
                assert.equal(f.validateValue('3').valid, true);
                assert.equal(f.validateValue(3).valid, true);
            });
            it('returns true when value <= maxValue', () => {
                let f = new NumberField('My Field', {maxValue: 6});
                assert.equal(f.validateValue('4').valid, true);
                assert.equal(f.validateValue(4).valid, true);
            });
            it('returns false when value > maxValuh', () => {
                let f = new NumberField('My Field', {maxValue: 2});
                assert.equal(f.validateValue('5').valid, false);
                assert.equal(f.validateValue(5).valid, false);
            });
        });
    });

    describe('IntegerField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new IntegerField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new IntegerField('My Field');
            });
        });
        describe('validateValue()', () => {
            it('returns true when value is an integer', () => {
                let f = new IntegerField('My Field');
                assert.equal(f.validateValue(123).valid, true);
                assert.equal(f.validateValue('10').valid, true);
            });
            it('returns false when value is not an integer', () => {
                let f = new IntegerField('My Field', {minLength: 2});
                assert.equal(f.validateValue('123.1').valid, false);
                assert.equal(f.validateValue(22.33).valid, false);
            });
        });
    });

    describe('FloatField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new FloatField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new FloatField('My Field');
            });
        });
    });

    describe('DecimalField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new DecimalField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new DecimalField('My Field');
            });
        });
    });

    describe('DateField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new DateField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new DateField('My Field');
            });
        });
    });

    describe('DateTimeField class', () => {
        it('can't be created without a label', () => '
            assert.throws(() => {
                new DateTimeField();
            });
        });
        it('can be created with a label', () => {
            assert.doesNotThrow(() => {
                new DateTimeField('My Field');
            });
        });*/
    });
});
