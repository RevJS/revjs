
import {
    AutoNumberField, TextField, RelatedModel, RelatedModelList
} from 'rev-models';
import { ApiOperations } from 'rev-api/lib/decorators';

@ApiOperations(
    ['read']
)
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

@ApiOperations(
    ['create', 'read', 'update', 'remove']
)
export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'User', label: 'Author' })
        user: User;
    @TextField({ label: 'Post Title' })
        title: string;
    @TextField({ multiLine: true, label: 'Post Content' })
        body: string;
    @RelatedModelList({ model: 'Comment', field: 'post', label: 'Comments' })
        comments: Comment[];

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

@ApiOperations(
    ['create', 'read', 'remove']
)
export class Comment {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'Post' })
        post: Post;
    @RelatedModel({ model: 'User', required: false })
        user: User;
    @TextField()
        comment: string;

    constructor(data?: Partial<Comment>) {
        Object.assign(this, data);
    }
}
