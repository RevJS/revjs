import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

(async function() {

    await loadTestData(models);

    // Retrieve Jane Doe's record
    const jane = await models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });
    console.log('Original Record:', jane.results[0]);

    // Make some changes and trigger an update
    const janeUpdated = jane.results[0];
    janeUpdated.email = 'jane.doe@gmail.com';
    janeUpdated.newsletter = false;
    await models.update(janeUpdated);

    // Check that Jane Doe's record has been updated
    const janeRetrieved = await models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });
    console.log('Updated Record:', janeRetrieved.results[0]);

})();

// It is also possible to target multiple records with an update using the
// 'where' option. Documentation TODO!