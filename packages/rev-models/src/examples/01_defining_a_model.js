"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../polyfills");
var m = require("../index");
// EXAMPLE:
// import * as rev from 'rev-models'
var TITLES = [
    ['Mr', 'Mr.'],
    ['Mrs', 'Mrs.'],
    ['Miss', 'Miss.'],
    ['Dr', 'Dr.']
];
var Person = (function () {
    function Person() {
    }
    return Person;
}());
__decorate([
    m.SelectionField('Title', TITLES, { required: false })
], Person.prototype, "title", void 0);
__decorate([
    m.TextField('First Name')
], Person.prototype, "first_name", void 0);
__decorate([
    m.TextField('Last Name')
], Person.prototype, "last_name", void 0);
__decorate([
    m.IntegerField('Age', { required: false })
], Person.prototype, "age", void 0);
__decorate([
    m.EmailField('Email')
], Person.prototype, "email", void 0);
__decorate([
    m.BooleanField('Registered for Newsletter?')
], Person.prototype, "newsletter", void 0);
exports.Person = Person;
m.register(Person);
