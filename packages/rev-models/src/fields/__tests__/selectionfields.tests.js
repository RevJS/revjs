"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selectionfields_1 = require("../selectionfields");
var validation_1 = require("../../models/validation");
var field_1 = require("../field");
var validators_1 = require("../validators");
var chai_1 = require("chai");
describe('rev.fields.selectionfields', function () {
    describe('BooleanField', function () {
        var testModel = {
            is_awesome: null
        };
        var testMeta = {
            fields: [new selectionfields_1.BooleanField('is_awesome', 'Awesome?')]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', opts);
            chai_1.expect(test.name).to.equal('is_awesome');
            chai_1.expect(test.label).to.equal('Awesome?');
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?');
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the booleanValidator by default', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: false });
            chai_1.expect(test.validators[0]).to.equal(validators_1.booleanValidator);
        });
        it('adds the "required" validator if options.required is true', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: true });
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.booleanValidator);
        });
        it('successfully validates a boolean value', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = false;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: false });
            testModel.is_awesome = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate on non-boolean value', function () {
            var test = new selectionfields_1.BooleanField('is_awesome', 'Awesome?', { required: true });
            testModel.is_awesome = 'evidently!';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
    describe('SelectionField', function () {
        var testModel = {
            value: null
        };
        var selection = [
            ['option1', 'Option 1'],
            ['option2', 'Option 2'],
            ['option3', 'Option 3']
        ];
        var testMeta = {
            fields: [new selectionfields_1.SelectionField('value', 'Value', selection)]
        };
        var result;
        beforeEach(function () {
            result = new validation_1.ModelValidationResult();
        });
        it('creates a field with properties as expected', function () {
            var opts = {};
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, opts);
            chai_1.expect(test.name).to.equal('value');
            chai_1.expect(test.label).to.equal('Value');
            chai_1.expect(test.selection).to.equal(selection);
            chai_1.expect(test.options).to.equal(opts);
            chai_1.expect(test).is.instanceof(field_1.Field);
        });
        it('sets default field options if they are not specified', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection);
            chai_1.expect(test.options).to.deep.equal(field_1.DEFAULT_FIELD_OPTIONS);
        });
        it('adds the singleSelectionValidator by default', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: false });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.singleSelectionValidator);
        });
        it('adds the required validator and stringEmpty validator if options.required is true', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: true });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.stringEmptyValidator);
            chai_1.expect(test.validators[2]).to.equal(validators_1.singleSelectionValidator);
        });
        it('adds the required validator and listEmpty validator if options.required is true and multiple = true', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: true, multiple: true });
            chai_1.expect(test.validators.length).to.equal(3);
            chai_1.expect(test.validators[0]).to.equal(validators_1.requiredValidator);
            chai_1.expect(test.validators[1]).to.equal(validators_1.listEmptyValidator);
            chai_1.expect(test.validators[2]).to.equal(validators_1.multipleSelectionValidator);
        });
        it('adds the multipleSelectionValidator if opts.multiple = true', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: false, multiple: true });
            chai_1.expect(test.validators.length).to.equal(1);
            chai_1.expect(test.validators[0]).to.equal(validators_1.multipleSelectionValidator);
        });
        it('cannot be created with a selection that is not an array', function () {
            chai_1.expect(function () {
                new selectionfields_1.SelectionField('value', 'Value', 'aaa');
            }).to.throw('"selection" parameter must be an array');
        });
        it('cannot be created with a single-dimension selection array', function () {
            chai_1.expect(function () {
                new selectionfields_1.SelectionField('value', 'Value', ['aaa', 'bbb']);
            }).to.throw('should be an array with two items');
        });
        it('cannot be created with a two-dimensional selection array with the wrong number of items', function () {
            chai_1.expect(function () {
                new selectionfields_1.SelectionField('value', 'Value', [
                    ['aaa'],
                    ['bbb', 'ccc'],
                    ['ddd', 'eee', 'fff']
                ]);
            }).to.throw('should be an array with two items');
        });
        it('successfully validates a single value', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection);
            testModel.value = 'option2';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates multiple values', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { multiple: true });
            testModel.value = ['option1', 'option3'];
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('successfully validates a null value if field not required', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: false });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', true);
        });
        it('does not validate on null value if field is required', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection, { required: true });
            testModel.value = null;
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate an invalid single value', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection);
            testModel.value = 'I am not an option';
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
        it('does not validate an invalid multi-value', function () {
            var test = new selectionfields_1.SelectionField('value', 'Value', selection);
            testModel.value = ['option1', 'nope', 'option3'];
            return chai_1.expect(test.validate(testModel, testMeta, { type: 'create' }, result))
                .to.eventually.have.property('valid', false);
        });
    });
});
