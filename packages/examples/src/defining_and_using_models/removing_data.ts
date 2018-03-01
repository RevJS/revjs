
import { City, modelManager } from './creating_models';

(async () => {

    await modelManager.create(new City({ name: 'Wellington' }));
    await modelManager.create(new City({ name: 'Auckland' }));
    await modelManager.create(new City({ name: 'Hamilton' }));
    await modelManager.create(new City({ name: 'Christchurch' }));

    const origRecords = await modelManager.read(City);
    console.log('Original Records:', origRecords.results);

    // Retrieve Auckland
    const cities = await modelManager.read(City, { where: {
            name: 'Auckland'
    }});

    // Remove it!
    await modelManager.remove(cities.results[0]);

    // Retrieve remaining records
    const newRecords = await modelManager.read(City);
    console.log('Remaining Records:', newRecords.results);

})();

// It is also possible to remove multiple records using the 'where' option
