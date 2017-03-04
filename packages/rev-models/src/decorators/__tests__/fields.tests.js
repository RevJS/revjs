"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var d = require("../fields");
var f = require("../../fields");
describe('rev.decorators.fields', function () {
    function expectFieldMeta(target, fieldName, type) {
        chai_1.expect(target.prototype.__fields).to.be.an('Array');
        chai_1.expect(target.prototype.__fields[0]).to.be.instanceof(type);
        chai_1.expect(target.prototype.__fields[0].name).to.equal(fieldName);
    }
    describe('Text Fields', function () {
        it('TextField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.TextField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.TextField);
        });
        it('PasswordField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.PasswordField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.PasswordField);
        });
        it('EmailField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.EmailField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.EmailField);
        });
        it('URLField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.URLField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.URLField);
        });
    });
    describe('Number Fields', function () {
        it('NumberField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.NumberField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.NumberField);
        });
        it('IntegerField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.IntegerField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.IntegerField);
        });
    });
    describe('Selection Fields', function () {
        it('BooleanField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.BooleanField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.BooleanField);
        });
        var selection = [
            ['option_1', 'One'],
            ['option_2', 'Two']
        ];
        it('SelectionField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.SelectionField('test', selection)
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.SelectionField);
        });
    });
    describe('Date & Time Fields', function () {
        it('DateField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.DateField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.DateField);
        });
        it('TimeField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.TimeField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.TimeField);
        });
        it('DateTimeField', function () {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            __decorate([
                d.DateTimeField('test')
            ], MyClass.prototype, "test", void 0);
            expectFieldMeta(MyClass, 'test', f.DateTimeField);
        });
    });
});
