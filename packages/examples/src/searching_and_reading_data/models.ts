
import {
    AutoNumberField, TextField, SelectField, BooleanField,
    IntegerField, ModelManager, InMemoryBackend
} from 'rev-models';

// Define model

const CATEGORIES = [
    ['agriculture', 'Agriculture'],
    ['music', 'Music'],
    ['science', 'Science'],
    ['technology', 'Technology'],
];

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @SelectField({ selection: CATEGORIES })
        category: string;
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @IntegerField({ required: false })
        rating: number;
    @BooleanField()
        published: boolean;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

// Create ModelManager

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(Post);

export async function createData() {

    await modelManager.create(new Post({
        category: 'agriculture',
        title: 'My First Post',
        body: 'This is a really cool post made in RevJS',
        rating: 3,
        published: true
    }));

    await modelManager.create(new Post({
        category: 'technology',
        title: 'RevJS is awesome!',
        body: 'I should use it for ALL TEH THINGZZZ!',
        rating: 5,
        published: true
    }));

    await modelManager.create(new Post({
        category: 'technology',
        title: 'Draft Post',
        body: 'Not ready to publish this just yet...',
        published: false
    }));

    await modelManager.create(new Post({
        category: 'science',
        title: 'Another Draft Post',
        body: 'This post sucks, so will not be published yet!',
        published: false
    }));

    await modelManager.create(new Post({
        category: 'science',
        title: 'Cool as post',
        body: 'Read this post, its great!...',
        rating: 5,
        published: true
    }));

    await modelManager.create(new Post({
        category: 'music',
        title: 'New release from Fiddy Cent',
        body: 'Its called "Ok, I admit it, I suck" :)',
        rating: 2,
        published: true
    }));

    await modelManager.create(new Post({
        category: 'music',
        title: 'New release from Bruno Mars',
        body: 'Its called "Daaaamn, you ugly"',
        rating: 2,
        published: true
    }));

}
