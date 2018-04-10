
import {
    AutoNumberField, TextField, RelatedModel, RelatedModelList,
    SelectField, DateField, IntegerField, IValidationContext
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
    @TextField()
        first_name: string;
    @TextField()
        last_name: string;
    @RelatedModelList({ model: 'Post', field: 'user' })
        posts: Post[];
    @RelatedModelList({ model: 'Comment', field: 'user' })
        comments: Comment[];

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    toString() {
        return this.first_name + ' ' + this.last_name;
    }
}

export const POST_STATUS = [
    ['draft', 'Draft'],
    ['published', 'Published']
];

@ApiOperations(
    ['create', 'read', 'update', 'remove']
)
export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @RelatedModel({ model: 'User', label: 'Author' })
        user: User;
    @DateField({ label: 'Post Date' })
        post_date: string;
    @SelectField({ label: 'Status', selection: POST_STATUS })
        status: string;
    @TextField({ label: 'Post Title' })
        title: string;
    @TextField({ label: 'Description' })
        description: string;
    @TextField({ multiLine: true, label: 'Body Text', required: false })
        body: string;
    @RelatedModelList({ model: 'Comment', field: 'post', label: 'Comments' })
        comments: Comment[];

    @IntegerField({ label: 'No. of Comments' })
        get number_of_comments() {
            return (this.comments && this.comments.length) || 0;
        }

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }

    validate(ctx: IValidationContext) {
        if (String(this.description).includes('fake news')) {
            ctx.result.addFieldError(
                'description', 'Description must not include fake news!');
        }
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
