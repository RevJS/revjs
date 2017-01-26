
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
                @d.TextField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.TextField);
        });

        it('PasswordField', () => {
            class MyClass {
                @d.PasswordField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.PasswordField);
        });

        it('EmailField', () => {
            class MyClass {
                @d.EmailField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.EmailField);
        });

        it('URLField', () => {
            class MyClass {
                @d.URLField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.URLField);
        });

    });

    describe('Number Fields', () => {

        it('NumberField', () => {
            class MyClass {
                @d.NumberField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.NumberField);
        });

        it('IntegerField', () => {
            class MyClass {
                @d.IntegerField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.IntegerField);
        });

    });


    describe('Selection Fields', () => {

        it('BooleanField', () => {
            class MyClass {
                @d.BooleanField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.BooleanField);
        });

        let selection = [
            ['option_1', 'One'],
            ['option_2', 'Two']
        ]

        it('SelectionField', () => {
            class MyClass {
                @d.SelectionField('test', selection)
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.SelectionField);
        });

    });

    describe('Date & Time Fields', () => {

        it('DateField', () => {
            class MyClass {
                @d.DateField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.DateField);
        });

        it('TimeField', () => {
            class MyClass {
                @d.TimeField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.TimeField);
        });

        it('DateTimeField', () => {
            class MyClass {
                @d.DateTimeField('test')
                    test: string;
            }
            expectFieldMeta(MyClass, 'test', f.DateTimeField);
        });

    });

});
