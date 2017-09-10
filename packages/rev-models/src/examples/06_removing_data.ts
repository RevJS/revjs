import { models } from './01_defining_a_model_registry';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

loadTestData(models)
.then(() => {

    return models.read(Person);

})
.then((res) => {

    console.log('Original Records:', res.results);

    // Retrieve Jane Doe's record
    return models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });

})
.then((res) => {

    // Remove Jane Doe's record
    return models.remove(res.results[0])

})
.then((res) => {

    // Retrieve remaining records
    return models.read(Person);

})
.then((res) => {

    console.log('Remaining Records:', res.results);

});

// It is also possible to remove multiple records using the 'where' option
// for the remove() method. Documentation TODO