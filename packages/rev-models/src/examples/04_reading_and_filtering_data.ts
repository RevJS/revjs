import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

(async function() {

    await loadTestData(models);

    const allRecords = await models.read(Person);
    console.log('All records:', allRecords.results);

    const last3Records = await models.read(Person, {}, { offset: 2, limit: 3 });
    console.log('Last 3 records:', last3Records.results);

    const subscribers = await models.read(Person, { newsletter: true });
    console.log('Newsletter Subscribers Only:', subscribers.results);

    const agedPeople = await models.read(Person, {
        _or: [
            { age: { _lt: 21 }},
            { age: { _gt: 40 }}
        ]
    });
    console.log('Aged less than 21 or over 40:', agedPeople.results);

})();
