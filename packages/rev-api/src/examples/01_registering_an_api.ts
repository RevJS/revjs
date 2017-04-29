
import * as rev from 'rev-models';
import { ModelApiRegistry } from '../index';

import { Person, models } from './test_model';

// EXAMPLE:
// import * as rev from 'rev-models';
// import * as api from 'rev-api';

let api = new ModelApiRegistry(models);

api.register(Person, {
    methods: {
        read: true,
        create: true,
        update: true,
        remove: true,
        unsubscribe: {
           args: ['email'],
           handler: async (context, email) => {
               console.log('Unsubscribe requested for', email);
               return 'Unsubscribed';
           }
        },
        randomMember: {
            args: [
                new rev.fields.TextField('name'),
                new rev.fields.IntegerField('minAge', {minValue: 16})
            ],
            handler: async (context, name) => {
               console.log('Getting a random member named', name);
               return {
                   first_name: 'Bob',
                   age: 21
               };
           }
        }
    }
});
