
import '../polyfills';
import * as rev from '../index';

// EXAMPLE:
// import * as rev from 'rev-models'

let TITLES = [
    ['Mr', 'Mr.'],
    ['Mrs', 'Mrs.'],
    ['Miss', 'Miss.'],
    ['Dr', 'Dr.']
];

export class Person {
    title: string;
    first_name: string;
    last_name: string;
    age: number;

    email: string;
    newsletter: boolean;
}

rev.register(Person, {
    fields: [
        new rev.SelectionField('title', 'Title', TITLES, { required: false }),
        new rev.TextField('first_name', 'First Name'),
        new rev.TextField('last_name', 'Last Name'),
        new rev.IntegerField('age', 'Age', { required: false }),
        new rev.EmailField('email', 'Email'),
        new rev.BooleanField('newsletter', 'Registered for Newsletter?')
    ]
});
