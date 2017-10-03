
import * as rev from 'rev-models';
import { ApiOperations, ApiMethod } from '../decorators/decorators';

@ApiOperations(['read'])
export class Person {

    @rev.TextField({label: 'Name'})
        name: string;
    @rev.IntegerField({label: 'Age', required: false })
        age: number;
    @rev.EmailField({label: 'Email'})
        email: string;

    @ApiMethod()
    unsubscribe(ctx: rev.IMethodContext<any>) {
        console.log('Unsubscribe requested for', this.email);
        return 'Unsubscribed';
    }

    @ApiMethod({ validateModel: false })
    randomMember(ctx: rev.IMethodContext<any>) {
        console.log('Getting a random member named', ctx.args.name);
        return {
            first_name: 'Bob',
            age: 21
        };
    }
}

console.log('test', (Person.prototype as any).__apiMethods);
console.log('test2', (Person.prototype as any).__apiOperations);

export const models: rev.ModelManager = new rev.ModelManager();
models.registerBackend('default', new rev.InMemoryBackend());
models.register(Person);
/*
let api = new ModelApiManager(models);

api.register({
    model: 'Person',
    operations: ['create', 'read', 'update', 'remove'],
    methods: ['unsubscribe',
        {
            name: 'randomMember',
            args: [
                new rev.fields.TextField('name')
            ],
            validateModel: false
        }
    ]
});
*/