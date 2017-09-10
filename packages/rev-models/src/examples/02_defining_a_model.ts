
import * as rev from 'rev-models';

import { models } from './01_defining_a_model_registry';

let TITLES = [
    ['Mr', 'Mr.'],
    ['Mrs', 'Mrs.'],
    ['Miss', 'Miss.'],
    ['Dr', 'Dr.']
];

export class Person extends rev.Model {

    @rev.AutoNumberField({ primaryKey: true })
        id: number;
    @rev.SelectionField({label: 'Title', selection: TITLES, required: false })
        title: string;
    @rev.TextField({label: 'First Name'})
        first_name: string;
    @rev.TextField({label: 'Last Name'})
        last_name: string;
    @rev.IntegerField({label: 'Age', required: false })
        age: number;

    @rev.EmailField({label: 'Email'})
        email: string;
    @rev.BooleanField({label: 'Registered for Newsletter?'})
        newsletter: boolean;

}

models.register(Person, {
    label: 'Registered Person',
    backend: 'default'
});
