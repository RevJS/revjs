
import { expect } from 'chai';
import * as d from '../fields';
import * as f from '../../fields';

describe('rev.decorators.fields', () => {

    function expectFieldMeta(target: any, fieldName: string, type: any) {
        expect(target.prototype.__fields).to.be.an('Array');
        expect(target.prototype.__fields[0]).to.be.instanceof(type);
        expect(target.prototype.__fields[0].name).to.equal(fieldName);
    }

    describe('Text Fields', () => {

        it('TextField', () => {
            class MyClass {
                @d.TextField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.TextField);
        });

        it('PasswordField', () => {
            class MyClass {
                @d.PasswordField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.PasswordField);
        });

        it('EmailField', () => {
            class MyClass {
                @d.EmailField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.EmailField);
        });

        it('URLField', () => {
            class MyClass {
                @d.URLField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.URLField);
        });

    });

    describe('Number Fields', () => {

        it('NumberField', () => {
            class MyClass {
                @d.NumberField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.NumberField);
        });

        it('IntegerField', () => {
            class MyClass {
                @d.IntegerField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.IntegerField);
        });

        it('AutoNumberField', () => {
            class MyClass {
                @d.AutoNumberField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.AutoNumberField);
        });

    });

    describe('Selection Fields', () => {

        it('BooleanField', () => {
            class MyClass {
                @d.BooleanField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.BooleanField);
        });

        let selection = [
            ['option_1', 'One'],
            ['option_2', 'Two']
        ];

        it('SelectionField', () => {
            class MyClass {
                @d.SelectionField({selection: selection})
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.SelectionField);
        });

    });

    describe('Date & Time Fields', () => {

        it('DateField', () => {
            class MyClass {
                @d.DateField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.DateField);
        });

        it('TimeField', () => {
            class MyClass {
                @d.TimeField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.TimeField);
        });

        it('DateTimeField', () => {
            class MyClass {
                @d.DateTimeField()
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.DateTimeField);
        });

    });

    describe('Selection Fields', () => {

        it('ReccordField', () => {
            class MyClass {
                @d.RelatedModel({ model: 'TestRelatedModel' })
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.RelatedModelField);
        });

        it('ReccordListField', () => {
            class MyClass {
                @d.RelatedModelList({ model: 'TestRelatedModel', field: 'foreignKeyField' })
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.RelatedModelListField);
        });

    });
});
