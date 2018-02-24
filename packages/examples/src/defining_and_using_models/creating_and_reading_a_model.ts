
import {
    AutoNumberField, TextField, SelectField,
    ModelManager, InMemoryBackend
} from 'rev-models';

// Define model

const POST_STATUS = [
    ['draft', 'Draft'],
    ['published', 'Published']
];

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField({ minLength: 5, maxLength: 100 })
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @SelectField({ selection: POST_STATUS })
        status: string;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

// Create ModelManager

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(Post);

(async () => {

    // Create some data

    await modelManager.create(new Post({
        title: 'My First Post',
        body: 'This is a really cool post made in RevJS',
        status: 'draft'
    }));

    await modelManager.create(new Post({
        title: 'RevJS is awesome!',
        body: 'I should use it for ALL TEH THINGZZZ!',
        status: 'published'
    }));

    // Read it back

    const res = await modelManager.read(Post, {
        where: {
            _or: [
                { title: { _like: '%RevJS%' }},
                { body: { _like: '%RevJS%' }}
            ]
        }
    });

    console.log(res.results);

})();
