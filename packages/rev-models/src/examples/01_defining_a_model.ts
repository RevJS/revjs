
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

    @m.SelectionField({label: 'Title', selection: TITLES, required: false })
        title: string;
    @m.TextField({label: 'First Name'})
        first_name: string;
    @m.TextField({label: 'Last Name'})
        last_name: string;
    @m.IntegerField({label: 'Age', required: false })
        age: number;

    @m.EmailField({label: 'Email'})
        email: string;
    @m.BooleanField({label: 'Registered for Newsletter?'})
        newsletter: boolean;
}

m.register(Person);
