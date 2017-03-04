
import '../polyfills';
import * as m from '../index';

// EXAMPLE:
// import * as rev from 'rev-models'

let TITLES = [
    ['Mr', 'Mr.'],
    ['Mrs', 'Mrs.'],
    ['Miss', 'Miss.'],
    ['Dr', 'Dr.']
];

export class Person {

    @m.SelectionField('Title', TITLES, { required: false })
        title: string;
    @m.TextField('First Name')
        first_name: string;
    @m.TextField('Last Name')
        last_name: string;
    @m.IntegerField('Age', { required: false })
        age: number;

    @m.EmailField('Email')
        email: string;
    @m.BooleanField('Registered for Newsletter?')
        newsletter: boolean;
}

m.register(Person);
