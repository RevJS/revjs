
import * as rev from 'rev-models';
import { ModelApiManager } from '../index';

import { Person, models } from './test_model';

// EXAMPLE:
// import * as rev from 'rev-models';
// import * as api from 'rev-api';

let api = new ModelApiManager(models);

api.register({
    model: Person,
    operations: ['create', 'read', 'update', 'remove'],
    methods: {
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
