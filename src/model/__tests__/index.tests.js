import { assert } from 'chai';
import Model from '../index';
import { IntegerField, TextField, DateField } from '../../fields';
import ValidationError from '../../errors/validation';

class TestModel extends Model {
    constructor(options) {
        super(options);
        this.addFields({
            id: new IntegerField("ID"),
            name: new TextField("Name"),
            date: new DateField("Date")
        });
    }
}

describe('Model class', () => {

    describe('constructor()', () => {

        it("should start with a null registry", () => {
            var model = new Model();
            assert.equal(model.registry, null);
        });

        it("should start with an empty fields dictionary", () => {
            var model = new Model();
            assert.deepEqual(model.fields, {});
        });

    });

    describe('addFields()', () => {

        it("should throw a TypeError when fieldsObj is not an object", () => {
            var model = new Model();
            assert.throws(() => model.addFields("abc"), TypeError);
        });

        it("should throw a TypeError when fieldsObj contains non-field values", () => {
            var model = new Model();
            assert.throws(() => model.addFields({
                field1: new IntegerField('int field'),
                field2: new Error("my test")
            }), TypeError);
        });

        it("should add fields to model.fields", () => {
            var model = new Model();
            assert.deepEqual(model.fields, {});
            var testFields = {
                field1: new IntegerField('int field'),
                field2: new TextField("string field")
            }
            model.addFields(testFields);
            assert.deepEqual(model.fields, testFields);
        });

    });

    describe("validateValues()", () => {

        it("should throw a TypeError when fieldsObj is not an object", () => {
            var model = new Model();
            assert.throws(() => model.validateValues("abc"), TypeError);
        });

        it("should throw a ValidationError when a field does not exist", () => {
            var model = new TestModel();
            try {
                model.validateValues({
                    wrongField: 'test'
                });
            }
            catch (e) {
                assert.instanceOf(e, ValidationError);
                assert.deepEqual(e.failedValidators, ['extraField']);
                return;
            }
            assert(false, "Exception not thrown.")
        });

    })

});