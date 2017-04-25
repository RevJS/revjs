
// EXAMPLE:
import { models } from './01_defining_a_model_registry';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

loadTestData(models)

.then(() => {
    return models.read(Person);
})
.then((res) => {
    console.log('All records:', res.results);
})

.then(() => {
    return models.read(Person, { newsletter: true });
})
.then((res) => {
    console.log('Newsletter Subscribers Only:', res.results);
})

.then(() => {
    return models.read(Person, {
        $or: [
            { age: { $lt: 21 }},
            { age: { $gt: 40 }}
        ]
    });
})
.then((res) => {
    console.log('Aged less than 21 or over 40:', res.results);
});
