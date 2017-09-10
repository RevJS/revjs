import { models } from './01_defining_a_model_manager';
import { Person } from './02_defining_a_model';
import { loadTestData } from './load_test_data';

loadTestData(models)

.then(() => models.read(Person))
.then((res) => {
    console.log('All records:', res.results);
})

.then(() => models.read(Person, {}, { offset: 2, limit: 3 }))
.then((res) => {
    console.log('Last 3 records:', res.results);
})

.then(() => models.read(Person, { newsletter: true }))
.then((res) => {
    console.log('Newsletter Subscribers Only:', res.results);
})

.then(() => models.read(Person, {
                $or: [
                    { age: { $lt: 21 }},
                    { age: { $gt: 40 }}
                ]
}))
.then((res) => {
    console.log('Aged less than 21 or over 40:', res.results);
});