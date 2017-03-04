"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rev = require("../index");
var _01_defining_a_model_1 = require("./01_defining_a_model");
// EXAMPLE:
// import * as rev from 'rev-models';
// import { Person } from './person';
var p1 = new _01_defining_a_model_1.Person();
p1.first_name = 'Bill';
p1.last_name = 'Bloggs';
p1.age = 31;
p1.email = 'bill@bloggs.com';
p1.newsletter = false;
var p2 = new _01_defining_a_model_1.Person();
p2.first_name = 'Jane';
p2.last_name = 'Doe';
p2.age = 22;
p2.email = 'jane@doe.com';
p2.newsletter = true;
Promise.all([
    rev.create(p1),
    rev.create(p2)
])
    .then(function () {
    // Get all people aged over 20 that are registered for the newsletter
    return rev.read(_01_defining_a_model_1.Person, {
        age: { $gt: 20 },
        newsletter: true
    });
})
    .then(function (records) {
    console.log(records);
});
