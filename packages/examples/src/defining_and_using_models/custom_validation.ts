
import {
    AutoNumberField, TextField, BooleanField,
    ModelManager, InMemoryBackend, IValidationContext
} from 'rev-models';

// Define model with some custom validation

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @BooleanField()
        is_published: boolean;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }

    // Define synchronous validation
    validate(ctx: IValidationContext) {
        if (this.body.includes('fake news')) {
            ctx.result.addFieldError('body', 'Body must not contain fake news!');
        }
    }

    // Define some asynchronous validation
    async validateAsync(ctx: IValidationContext) {
        if (ctx.operation.operationName == 'create') {
            const duplicates = await ctx.manager.read(Post, {
                where: {
                    title: { _like: this.title }
                }
            });
            if (duplicates.meta.totalCount > 0) {
                ctx.result.addFieldError('title', 'Cannot create post with a duplicate title!');
            }
        }
    }
}

// Create ModelManager

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(Post);

// Create some data

(async () => {
    try {

        // Create a valid post
        await modelManager.create(new Post({
            title: 'This is a valid post',
            body: 'No alternative facts here!',
            is_published: true
        }));

        // Try to create a duplicate post...
        await modelManager.create(new Post({
            title: 'This is a valid post',
            body: 'Not really! Its a duplicate, so should cause an error...',
            is_published: true
        }));

    }
    catch (e) {
        console.error(e.message);
    }
})();
