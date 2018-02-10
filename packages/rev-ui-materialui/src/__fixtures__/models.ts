import {
    IntegerField, TextField, BooleanField, DateTimeField,
    ModelManager, InMemoryBackend,
} from 'rev-models';

export class Post {
    @IntegerField({ primaryKey: true })
        id: number;
    @TextField()
        title: string;
    @TextField()
        body: string;
    @TextField({ required: false })
        keywords: string;
    @BooleanField()
        published: boolean;
    @DateTimeField()
        post_date: string;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

export function getModelManager() {
    const modelManager = new ModelManager();
    modelManager.registerBackend('default', new InMemoryBackend());
    modelManager.register(Post);
    return modelManager;
}