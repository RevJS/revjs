import { ModelManager } from '../registry/registry';
import { Person } from './02_defining_a_model';

export function loadTestData(models: ModelManager): Promise<any> {

    return Promise.all([
        models.create(new Person({
            first_name: 'Bill', last_name: 'Bloggs',
            age: 31, email: 'bill@bloggs.com', newsletter: false
        })),
        models.create(new Person({
            first_name: 'Wayne', last_name: 'Young',
            age: 25, email: 'wayne@mail.com', newsletter: true
        })),
        models.create(new Person({
            first_name: 'Jane', last_name: 'Doe',
            age: 22, email: 'jane@doe.com', newsletter: true
        })),
        models.create(new Person({
            first_name: 'Felix', last_name: 'Johnson',
            age: 45, email: 'felix@jj.com', newsletter: false
        })),
        models.create(new Person({
            first_name: 'Anna', last_name: 'Green',
            age: 19, email: 'anna@green.com', newsletter: true
        })),
    ]);

}