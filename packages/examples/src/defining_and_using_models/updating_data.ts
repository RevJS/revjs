import { City, modelManager } from './creating_models';

(async () => {

    await modelManager.create(new City({ name: 'Wellington' }));
    await modelManager.create(new City({ name: 'Auckland' }));
    await modelManager.create(new City({ name: 'Hamilton' }));
    await modelManager.create(new City({ name: 'Christchurch' }));

    // Retrieve Auckland's record
    const cities = await modelManager.read(City, { where: {
            name: 'Auckland'
    }});
    console.log('Original Record:', cities.results[0]);

    // Change it's name and trigger an update
    const auckland = cities.results[0];
    auckland.name = 'City of Sails';
    await modelManager.update(auckland);

    // Check that Auckland's record has been updated
    const janeRetrieved = await modelManager.read(City, { where: {
            name: 'City of Sails'
    }});
    console.log('Updated Record:', janeRetrieved.results[0]);

})();

// It is also possible to target multiple records with an update using the
// 'where' option.
