import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

loadTestData(models)
.then(() => {

    // Retrieve Jane Doe's record
    return models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });

})
.then((res) => {

    console.log('Original Record:', res.results[0]);

    // Make some changes and trigger an update
    let record = res.results[0];
    record.email = 'jane.doe@gmail.com';
    record.newsletter = true;
    return models.update(record);

})
.then(() => {

    // Retrieve Jane Doe's record again
    return models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });

})
.then((res) => {

    console.log('Updated Record:', res.results[0]);

});

// It is also possible to update multiple records using the 'where' option
// for the update() method. Documentation TODO