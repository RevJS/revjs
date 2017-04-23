import { expect } from 'chai';
import * as d from '../../decorators';
import { IModelMeta } from '../../models/meta';
import { Model } from '../../models/model';
import { TextField } from '../../fields/';
import { validate } from '../validate';
import { VALIDATION_MESSAGES as msg } from '../../validation/validationmsg';
import { ModelRegistry } from '../../registry/registry';
import { InMemoryBackend } from '../../backends/inmemory/backend';

describe('validate()', () => {

    class TestModel extends Model {
        @d.IntegerField({ minValue: 10 })
            id: number;
        @d.TextField()
            name: string;
        @d.DateField({ required: false })
            date: Date;
    }

    let registry = new ModelRegistry();
    registry.registerBackend('default', new InMemoryBackend());
    registry.register(TestModel);

    it('should return a valid result if valid object is passed', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: new Date()
        });

        return validate(registry, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(true);
            });
    });

    it('should reject if model not registered', () => {
        class UnregisteredModel extends Model {}
        let test = new UnregisteredModel();
        return expect(validate(registry, test, {operation: 'create'}))
            .to.be.rejectedWith('is not registered');
    });

    it('should return an invalid result if extra fields are present', () => {

        let test = new TestModel({
            id: 11,
            name: 'Harry',
            date: new Date(),
            extra: 'stuff'
        });

        return validate(registry, test, {operation: 'create'})
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

        return validate(registry, test, {operation: 'create'})
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

        return validate(registry, test, {operation: 'create'})
            .then((res) => {
                expect(res.valid).to.equal(false);
                expect(res.fieldErrors['name'].length).to.equal(1);
                expect(res.fieldErrors['name'][0]['message']).to.equal(msg.required('name'));
                expect(res.fieldErrors['name'][0]['code']).to.equal('required');
            });
    });

    it('should reject if validation timeout expires', () => {
        let delayModelMeta: IModelMeta<any> = {
            fields: []
        };
        let delayField = new TextField('test');
        delayField.asyncValidators.push((...args: any[]) => {
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 10000);
            });
        });
        delayModelMeta.fields.push(delayField);

        class DelayModel extends Model {}
        registry.register(DelayModel, delayModelMeta);
        let test = new DelayModel();

        return expect(validate(registry, test, {operation: 'create'}, { timeout: 10}))
            .to.be.rejectedWith('timed out');
    });

});
