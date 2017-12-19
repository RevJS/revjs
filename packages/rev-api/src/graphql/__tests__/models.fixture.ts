import {
    ModelManager, InMemoryBackend,
    IntegerField, TextField, DateField, BooleanField, DateTimeField
} from 'rev-models';

export class User {
    @IntegerField()
        id: number = 1;
    @TextField()
        name: string = 'A Test Model';
    @DateField()
        date_registered: Date = new Date();

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    userMethod1() {}
}

export class Post {
    @IntegerField()
        id: number = 10;
    @TextField()
        title: string;
    @TextField()
        body: string;
    @BooleanField()
        published: boolean;
    @DateTimeField()
        post_date: Date;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }

    postMethod1() {}
    postMethod2() {}
    postMethod3() {}
}

export function getModelManager() {
    const modelManager = new ModelManager();
    modelManager.registerBackend('default', new InMemoryBackend());
    modelManager.register(User);
    modelManager.register(Post);
    return modelManager;
}
