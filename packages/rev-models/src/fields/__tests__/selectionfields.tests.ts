import { BooleanField, SelectionField } from '../selectionfields';
import { ModelValidationResult } from '../../models/validation';
import { IFieldOptions, Field, DEFAULT_FIELD_OPTIONS } from '../field';
import { booleanValidator, requiredValidator, singleSelectionValidator, stringEmptyValidator, listEmptyValidator, multipleSelectionValidator } from '../validators';

import { expect } from 'chai';

describe('rev.fields.selectionfields', () => {

    describe('BooleanField', () => {
        let testModel = {
            is_awesome: <any> null
        };
        let testMeta = {
            fields: [new BooleanField('is_awesome', 'Awesome?')]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new BooleanField('is_awesome', 'Awesome?', opts);
            expect(test.name).to.equal('is_awesome');
            expect(test.label).to.equal('Awesome?');
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new BooleanField('is_awesome', 'Awesome?');
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the booleanValidator by default', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: false });
            expect(test.validators[0]).to.equal(booleanValidator);
        });

        it('adds the "required" validator if options.required is true', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: true });
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(booleanValidator);
        });

        it('successfully validates a boolean value', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = false;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: false });
            testModel.is_awesome = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate on non-boolean value', () => {
            let test = new BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = 'evidently!';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

    });

    describe('SelectionField', () => {
        let testModel = {
            value: <any> null
        };
        let selection = [
            ['option1', 'Option 1'],
            ['option2', 'Option 2'],
            ['option3', 'Option 3']
        ];
        let testMeta = {
            fields: [new SelectionField('value', 'Value', selection)]
        };
        let result: ModelValidationResult;

        beforeEach(() => {
            result = new ModelValidationResult();
        });

        it('creates a field with properties as expected', () => {
            let opts: IFieldOptions = {};
            let test = new SelectionField('value', 'Value', selection, opts);
            expect(test.name).to.equal('value');
            expect(test.label).to.equal('Value');
            expect(test.selection).to.equal(selection);
            expect(test.options).to.equal(opts);
            expect(test).is.instanceof(Field);
        });

        it('sets default field options if they are not specified', () => {
            let test = new SelectionField('value', 'Value', selection);
            expect(test.options).to.deep.equal(DEFAULT_FIELD_OPTIONS);
        });

        it('adds the singleSelectionValidator by default', () => {
            let test = new SelectionField('value', 'Value', selection, { required: false });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(singleSelectionValidator);
        });

        it('adds the required validator and stringEmpty validator if options.required is true', () => {
            let test = new SelectionField('value', 'Value', selection, { required: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(stringEmptyValidator);
            expect(test.validators[2]).to.equal(singleSelectionValidator);
        });

        it('adds the required validator and listEmpty validator if options.required is true and multiple = true', () => {
            let test = new SelectionField('value', 'Value', selection, { required: true, multiple: true });
            expect(test.validators.length).to.equal(3);
            expect(test.validators[0]).to.equal(requiredValidator);
            expect(test.validators[1]).to.equal(listEmptyValidator);
            expect(test.validators[2]).to.equal(multipleSelectionValidator);
        });

        it('adds the multipleSelectionValidator if opts.multiple = true', () => {
            let test = new SelectionField('value', 'Value', selection, { required: false, multiple: true });
            expect(test.validators.length).to.equal(1);
            expect(test.validators[0]).to.equal(multipleSelectionValidator);
        });

        it('cannot be created with a selection that is not an array', () => {
            expect(() => {
                new SelectionField('value', 'Value', <any> 'aaa');
            }).to.throw('"selection" parameter must be an array');
        });

        it('cannot be created with a single-dimension selection array', () => {
            expect(() => {
                new SelectionField('value', 'Value', <any> ['aaa', 'bbb']);
            }).to.throw('should be an array with two items');
        });

        it('cannot be created with a two-dimensional selection array with the wrong number of items', () => {
            expect(() => {
                new SelectionField('value', 'Value', [
                    ['aaa'],
                    ['bbb', 'ccc'],
                    ['ddd', 'eee', 'fff']
                ]);
            }).to.throw('should be an array with two items');
        });

        it('successfully validates a single value', () => {
            let test = new SelectionField('value', 'Value', selection);
            testModel.value = 'option2';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates multiple values', () => {
            let test = new SelectionField('value', 'Value', selection, { multiple: true });
            testModel.value = ['option1', 'option3'];
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('successfully validates a null value if field not required', () => {
            let test = new SelectionField('value', 'Value', selection, { required: false });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', true);
        });

        it('does not validate on null value if field is required', () => {
            let test = new SelectionField('value', 'Value', selection, { required: true });
            testModel.value = null;
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate an invalid single value', () => {
            let test = new SelectionField('value', 'Value', selection);
            testModel.value = 'I am not an option';
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

        it('does not validate an invalid multi-value', () => {
            let test = new SelectionField('value', 'Value', selection);
            testModel.value = ['option1', 'nope', 'option3'];
            return expect(test.validate(testModel, testMeta, {type: 'create'}, result))
                .to.eventually.have.property('valid', false);
        });

    });

});
