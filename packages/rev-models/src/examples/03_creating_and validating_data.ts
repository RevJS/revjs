import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';

let person = new Person();
person.first_name = 'Bill';
person.last_name = 'Bloggs';
person.age = 31;
person.email = 'bill@bloggs.com';
person.newsletter = false;

models.create(person)
.then((res) => {
    console.log('Created Person ID', res.result.id);
});

// models.create() will reject if model is invalid
// you can also manually trigger validation:

let invalid_person = new Person();
invalid_person.title = 'invalid_title';

models.validate(invalid_person)
.then((res) => {
    if (!res.valid) {
        console.log('Field errors:', res.fieldErrors);
        console.log('Model errors:', res.modelErrors);
    }
});