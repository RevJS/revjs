
import * as rev from 'rev-models';
import { ApiOperations, ApiMethod } from '../decorators/decorators';
import { ModelApiManager } from '../index';

@ApiOperations(['read'])
export class Person {

    @rev.TextField({label: 'Name'})
        name: string;
    @rev.IntegerField({label: 'Age', required: false })
        age: number;
    @rev.EmailField({label: 'Email'})
        email: string;
    @rev.BooleanField()
        subscribed: boolean;

    @ApiMethod()
    unsubscribe(ctx: rev.IMethodContext<any>) {
        this.subscribed = false;
        ctx.manager.update(this);
    }

    @ApiMethod({ modelData: false })
    randomMember(ctx: rev.IMethodContext<any>) {
        console.log('Generating a member named', ctx.args.name);
        return {
            name: ctx.args.name,
            age: 21
        };
    }
}

// Register Model
const models: rev.ModelManager = new rev.ModelManager();
models.registerBackend('default', new rev.InMemoryBackend());
models.register(Person);

// Register Model API
let api = new ModelApiManager(models);
api.register(Person);
