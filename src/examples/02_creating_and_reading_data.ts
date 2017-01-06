
import * as rev from '../index';
import { Person } from './01_defining_a_model';

// EXAMPLE:
// import * as rev from 'revjs';
// import { Person } from './person';

let p = new Person();
p.first_name = 'Joe';
p.last_name = 'Bloggs';
p.email = 'joe@bloggs.com';
p.newsletter = false;

rev.create(p)
    .then((res) => {
        return rev.read(Person, { first_name: 'Joe' });
    })
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.error(err);
    });
