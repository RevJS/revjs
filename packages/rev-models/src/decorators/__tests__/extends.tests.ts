
import { expect } from 'chai';
import * as d from '../fields';

describe('rev.decorators.fields - extended model tests', () => {

    function expectToHaveFields(target: any, fieldNames: string[]) {
        expect(target.prototype.__fields).to.be.an('Array');
        expect(target.prototype.__fields).to.have.length(fieldNames.length);
        fieldNames.forEach((name, idx) => {
            expect(target.prototype.__fields[idx].name).to.equal(name);
        });
    }

    class BaseModel {
        @d.AutoNumberField()
            baseId: number;
        @d.TextField()
            baseName: string;
    }

    class ExtendedModel1 extends BaseModel {
        @d.TextField()
            firstExtendedField: string;
    }

    class ExtendedModel2 extends BaseModel {
        @d.TextField()
            secondExtendedField: string;
    }

    it('BaseModel has correct fields', () => {
        expectToHaveFields(BaseModel, [
            'baseId', 'baseName'
        ]);
    });

    it('ExtendedModel1 has correct fields', () => {
        expectToHaveFields(ExtendedModel1, [
            'baseId', 'baseName', 'firstExtendedField'
        ]);
    });

    it('ExtendedModel2 has correct fields', () => {
        expectToHaveFields(ExtendedModel2, [
            'baseId', 'baseName', 'secondExtendedField'
        ]);
    });

});
