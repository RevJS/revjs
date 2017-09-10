
import { models } from './01_defining_a_model_registry';
import { Person } from './02_defining_a_model';

let person = new Person({
    first_name: 'Bill', last_name: 'Bloggs',
    age: 31, email: 'bill@bloggs.com', newsletter: false
});

models.create(person)
.then((res) => {
    console.log('Created Person ID', res.result.id);
});

// models.create() will reject if model is invalid
// you can also manually trigger validation:

let invalid_person = new Person({
    title: 'invalid_title'
});

models.validate(invalid_person)
.then((res) => {
    if (!res.valid) {
        console.log('Field errors:', res.fieldErrors);
        console.log('Model errors:', res.modelErrors);
    }
});
