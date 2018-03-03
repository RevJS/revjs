import { modelManager, City, Customer } from './creating_models';

(async () => {

    const city1 = new City({
        name: 'Wellington'
    });
    const createResult = await modelManager.create(city1);

    const customer1 = new Customer({
        first_name: 'Jim',
        last_name: 'Jones',
        age: 35,
        gender: 'M',
        city: createResult.result
    });
    await modelManager.create(customer1);

})();
