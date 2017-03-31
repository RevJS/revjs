import { expect } from 'chai';
import * as d from '../../decorators';
import { initialiseMeta } from '../../models/meta';
import { Model } from '../../models/model';
import { TextField } from '../../fields/';
import { modelValidate } from '../validate';
import { VALIDATION_MESSAGES as msg } from '../../validation/validationmsg';

describe('modelValidate()', () => {

    class TestModel extends Model {
        @d.IntegerField({ minValue: 10 })
            id: number;
        @d.TextField()
            name: string;
        @d.DateField({ required: false })
            date: Date;
    }

    initialiseMeta(TestModel);

    it('should return a valid result if valid object is passed', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: new Date()
        });

        return modelValidate(test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(true);
            });
    });

    it('should reject if un-initialised metadata is passed', () => {
        class UninitedModel extends Model {}
        UninitedModel.meta = {
            fields: []
        };
        let test = new UninitedModel();

        return modelValidate(test, {operation: 'create'})
            .then((res) => {
                expect(false, 'Did not reject').to.be.true;
            })
            .catch((err) => {
                expect(err.message).to.contain('metadata has not been initialised');
            });
    });

    it('should return an invalid result if extra fields are present', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: new Date(),
            extra: 'stuff'
        });

        return modelValidate(test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.modelErrors.length).to.equal(1);
                expect(res.modelErrors[0]['message']).to.equal(msg.extra_field('extra'));
                expect(res.modelErrors[0]['code']).to.equal('extra_field');
            });
    });

    it('should return an invalid result if a field value is invalid', () => {

        let test = new TestModel({
            id: 2,
            name: 'Harry',
            date: new Date()
        });

        return modelValidate(test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.fieldErrors['id'].length).to.equal(1);
                expect(res.fieldErrors['id'][0]['message']).to.equal(msg.min_value('id', 10));
                expect(res.fieldErrors['id'][0]['code']).to.equal('min_value');
            });
    });

    it('should return an invalid result if a required field is not set', () => {

        let test = new TestModel({
            id: 11
        });

        return modelValidate(test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.fieldErrors['name'].length).to.equal(1);
                expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('name'));
                expect(res.fieldErrors['name'][0]['code']).to.equal('required');
            });
    });

    it('should reject if validation timeout expires', () => {

        class DelayModel extends Model {}
        DelayModel.meta = { fields: [] };
        initialiseMeta(DelayModel);

        let delayField = new TextField('test');
        delayField.asyncValidators.push((...args: any[]) => {
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 10000);
            });
        });

        DelayModel.meta.fields.push(delayField);
        let test = new DelayModel();

        return modelValidate(test, {operation: 'create'}, { timeout: 10})
            .then((res) => {
                expect(false, 'Did not reject').to.be.true;
            })
            .catch((err) => {
                expect(err.message).to.contain('timed out');
            });
    });

});
