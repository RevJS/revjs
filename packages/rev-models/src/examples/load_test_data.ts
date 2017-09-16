import { ModelManager } from '../models/manager';
import { Person } from './02_defining_a_model';
import { InMemoryBackend } from '../backends/inmemory/backend';

export function loadTestData(models: ModelManager): Promise<any> {

    let backend = models.getBackend('default') as InMemoryBackend;

    return backend.load(models, Person, [
        {
            first_name: 'Bill', last_name: 'Bloggs',
            age: 31, email: 'bill@bloggs.com', newsletter: false
        },
        {
            first_name: 'Wayne', last_name: 'Young',
            age: 25, email: 'wayne@mail.com', newsletter: true
        },
        {
            first_name: 'Jane', last_name: 'Doe',
            age: 22, email: 'jane@doe.com', newsletter: true
        },
        {
            first_name: 'Felix', last_name: 'Johnson',
            age: 45, email: 'felix@jj.com', newsletter: false
        },
        {
            first_name: 'Anna', last_name: 'Green',
            age: 19, email: 'anna@green.com', newsletter: true
        }
    ]);

}