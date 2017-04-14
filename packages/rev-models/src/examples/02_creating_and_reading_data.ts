
import * as rev from '../index';
import { Person } from './01_defining_a_model';

// EXAMPLE:
// import * as rev from 'rev-models';
// import { Person } from './person';

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
    rev.create(person1),
    rev.create(person2)
])
.then((res) => {
    return rev.read(Person, {
        age: { $gt: 20 },
        newsletter: true
    });
})
.then((res) => {
    console.log(res.results);
})
.catch((err) => {
    console.error(err);
});
