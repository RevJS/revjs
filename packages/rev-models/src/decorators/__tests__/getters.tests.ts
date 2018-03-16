
import { expect } from 'chai';
import * as d from '../fields';
import * as f from '../../fields';

describe('rev.decorators.fields - properties with getter methods', () => {

    it('Created field has stored set to false', () => {
        class MyClass {
            @d.TextField()
                get test() {
                    return 'Joe';
                }
        }
        const proto = MyClass.prototype as any;
        expect(proto.__fields).to.be.an('Array');
        expect(proto.__fields[0]).to.be.instanceof(f.TextField);
        expect(proto.__fields[0].name).to.equal('test');
        expect(proto.__fields[0].options.stored).to.be.false;
    });

    it('Created field can override stored option', () => {
        class MyClass {
            @d.TextField({ stored: true })
                get test() {
                    return 'Joe';
                }
        }
        const proto = MyClass.prototype as any;
        expect(proto.__fields).to.be.an('Array');
        expect(proto.__fields[0]).to.be.instanceof(f.TextField);
        expect(proto.__fields[0].name).to.equal('test');
        expect(proto.__fields[0].options.stored).to.be.true;
    });

    it('Created field has required set to false', () => {
        class MyClass {
            @d.TextField()
                get test() {
                    return 'Joe';
                }
        }
        const proto = MyClass.prototype as any;
        expect(proto.__fields).to.be.an('Array');
        expect(proto.__fields[0]).to.be.instanceof(f.TextField);
        expect(proto.__fields[0].name).to.equal('test');
        expect(proto.__fields[0].options.required).to.be.false;
    });

    it('Created field can override required option', () => {
        class MyClass {
            @d.TextField({ required: true })
                get test() {
                    return 'Joe';
                }
        }
        const proto = MyClass.prototype as any;
        expect(proto.__fields).to.be.an('Array');
        expect(proto.__fields[0]).to.be.instanceof(f.TextField);
        expect(proto.__fields[0].name).to.equal('test');
        expect(proto.__fields[0].options.required).to.be.true;
    });

});
