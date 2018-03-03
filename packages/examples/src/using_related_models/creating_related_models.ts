
import {
    AutoNumberField, TextField, RelatedModel, RelatedModelList,
    ModelManager, InMemoryBackend
} from 'rev-models';

export class User {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        username: string;
    @RelatedModelList({ model: 'Post', field: 'user' })
        posts: Post[];
    @RelatedModelList({ model: 'Comment', field: 'user' })
        comments: Comment[];

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }
}

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'User' })
        user: User;
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @RelatedModelList({ model: 'Comment', field: 'post' })
        comments: Comment[];

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

export class Comment {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'Post' })
        post: Post;
    @RelatedModel({ model: 'User' })
        user: User;
    @TextField()
        comment: string;

    constructor(data?: Partial<Comment>) {
        Object.assign(this, data);
    }
}

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(User);
modelManager.register(Post);
modelManager.register(Comment);
