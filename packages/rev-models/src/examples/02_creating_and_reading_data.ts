
import * as rev from '../index';
import { Person } from './01_defining_a_model';

// EXAMPLE:
// import * as rev from 'rev-models';
// import { Person } from './person';

let p1 = new Person();
p1.first_name = 'Bill';
p1.last_name = 'Bloggs';
p1.age = 31;
p1.email = 'bill@bloggs.com';
p1.newsletter = false;

let p2 = new Person();
p2.first_name = 'Jane';
p2.last_name = 'Doe';
p2.age = 22;
p2.email = 'jane@doe.com';
p2.newsletter = true;

Promise.all([
    rev.create(p1),
    rev.create(p2)
])
.then(() => {
    // Get all people aged over 20 that are registered for the newsletter
    return rev.read(Person, {
        age: { $gt: 20 },
        newsletter: true
    });
})
.then((records) => {
    console.log(records);
});
