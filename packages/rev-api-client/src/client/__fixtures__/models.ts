import {
    ModelManager, InMemoryBackend,
    TextField, DateField, BooleanField, DateTimeField,
    AutoNumberField, RelatedModel, RelatedModelList
} from 'rev-models';

export class User {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        name: string;
    @DateField()
        date_registered: string;
    @RelatedModelList({ model: 'Post', field: 'user' })
        posts: Post[];

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    userMethod1() {}
}

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        title: string;
    @TextField()
        body: string;
    @BooleanField()
        published: boolean;
    @DateTimeField()
        post_date: string;
    @RelatedModel({ model: 'User' })
        user: User;
    @RelatedModelList({ model: 'Comment', field: 'post' })
        comments: Comment[];

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }

    postMethod1() {}
    postMethod2() {}
    postMethod3() {}
}

export class Comment {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'Post' })
        post: Post;
    @TextField()
        comment: string;
    @RelatedModel({ model: 'User' })
        user: User;

    constructor(data?: Partial<Comment>) {
        Object.assign(this, data);
    }
}

export function getModelManager() {
    const modelManager = new ModelManager();
    modelManager.registerBackend('default', new InMemoryBackend());
    modelManager.register(User);
    modelManager.register(Post);
    modelManager.register(Comment);
    return modelManager;
}
