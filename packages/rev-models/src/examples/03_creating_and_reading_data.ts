
// EXAMPLE:
import { models } from './01_defining_a_model_registry';
import { Person } from './02_defining_a_model';

let person1 = new Person({
    first_name: 'Bill',
    last_name: 'Bloggs',
    age: 31,
    email: 'bill@bloggs.com',
    newsletter: false
});

let person2 = new Person({
    first_name: 'Jane',
    last_name: 'Doe',
    age: 22,
    email: 'jane@doe.com',
    newsletter: true
});

Promise.all([
    models.create(person1),
    models.create(person2)
])
.then((res) => {
    return models.read(Person);
})
.then((res) => {
    console.log(res.results);
})
.catch((err) => {
    console.error(err);
});
