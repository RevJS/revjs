import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

(async function() {

    await loadTestData(models);

    const origRecords = await models.read(Person);
    console.log('Original Records:', origRecords.results);

    // Retrieve Jane Doe's record
    const jane = await models.read(Person, {
        first_name: 'Jane',
        last_name: 'Doe'
    });

    // Remove Jane Doe's record
    await models.remove(jane.results[0]);

    // Retrieve remaining records
    const newRecords = await models.read(Person);
    console.log('Remaining Records:', newRecords.results);

})();

// It is also possible to remove multiple records using the 'where' option
// for the remove() method. Documentation TODO