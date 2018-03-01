import { City, modelManager } from './creating_models';

(async () => {

    await modelManager.create(new City({ name: 'Wellington' }));
    await modelManager.create(new City({ name: 'Auckland' }));
    await modelManager.create(new City({ name: 'Hamilton' }));
    await modelManager.create(new City({ name: 'Christchurch' }));

    // No filter
    const allRecords = await modelManager.read(City);
    console.log('All cities:', allRecords.results);

    // Sorting
    const sortedRecords = await modelManager.read(City, { orderBy: ['name'] });
    console.log('All cities, sorted by name:', sortedRecords.results);

    // Searching

    const subscribers = await modelManager.read(City, {
        where: {
            name: { _like: '%ton' }
        }
    });
    console.log('Cities that end in "ton":', subscribers.results);

    const agedPeople = await modelManager.read(City, { where: {
        _or: [
            { name: { _like: '%e%' }},
            { name: { _like: '%a%' }}
        ]
    }});
    console.log('Cities that have an E or an A in the name:', agedPeople.results);

    // Paging

    const last3Records = await modelManager.read(City, { orderBy: ['name'], offset: 2, limit: 2 });
    console.log('Last 2 records:', last3Records.results);

})();
