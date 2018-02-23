import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';

(async function() {

    let person = new Person();
    person.first_name = 'Bill';
    person.last_name = 'Bloggs';
    person.age = 31;
    person.email = 'bill@bloggs.com';
    person.newsletter = false;

    // models.create() will reject if model is invalid

    let res = await models.create(person);
    console.log('Created Person ID', res.result.id);

    // You can also manually trigger validation:

    let invalid_person = new Person();
    invalid_person.title = 'invalid_title';

    let res2 = await models.validate(invalid_person);

    if (!res2.valid) {
        console.log('Field errors:', res2.fieldErrors);
        console.log('Model errors:', res2.modelErrors);
    }

})();
