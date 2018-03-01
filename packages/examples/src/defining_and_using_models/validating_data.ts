
import { Customer, modelManager } from './creating_models';

(async () => {

    let person = new Customer({
        first_name: 'Bill',
        last_name: 'Bloggs',
        age: 31,
        gender: 'M'
    });

    // models.create() will throw if model is invalid

    let res = await modelManager.create(person);
    console.log('Created Customer ID', res.result.id);

    // You can also manually trigger validation:

    let invalid_person = new Customer();
    invalid_person.gender = 'Z';

    let validationResult = await modelManager.validate(invalid_person);

    if (!validationResult.valid) {
        console.log('Field errors:', validationResult.fieldErrors);
        console.log('Model errors:', validationResult.modelErrors);
    }

})();
