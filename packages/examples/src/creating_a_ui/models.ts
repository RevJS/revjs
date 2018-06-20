
import {
    AutoNumberField, TextField, RelatedModel, RelatedModelList,
    SelectField, DateField, IntegerField, IValidationContext,
    NumberField, TimeField, DateTimeField, EmailField, URLField,
    PasswordField, BooleanField, MultiSelectField
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

@ApiOperations(
    ['create', 'read', 'update', 'remove']
)
export class ModelWithAllFields {
    @TextField({ label: 'Text Field', required: false })
        textField: string;
    @TextField({ label: 'Multi-line Text Field', multiLine: true, required: false })
        multilineTextField: string;
    @EmailField({ label: 'Email Field', required: false })
        emailField: string;
    @URLField({ label: 'URL Field', required: false })
        urlField: string;
    @PasswordField({ label: 'Password Field', required: false })
        passwordField: string;
    @NumberField({ label: 'Number Field', required: false })
        numberField: number;
    @IntegerField({ label: 'Integer Field', required: false })
        integerField: number;
    @AutoNumberField({ primaryKey: true })
        autoNumberField: number;
    @BooleanField({ label: 'Boolean Field', required: false })
        booleanField: string;
    @SelectField({ label: 'Select Field', selection: POST_STATUS, required: false })
        selectField: string;
    @MultiSelectField({ label: 'Multi Select Field', selection: POST_STATUS, required: false })
        multiSelectField: string;
    @DateField({ label: 'Date Field', required: false })
        dateField: string;
    @TimeField({ label: 'Time Field', required: false })
        timeField: string;
    @DateTimeField({ label: 'Date & Time Field', required: false })
        dateTimeField: string;
    @RelatedModel({ model: 'User', label: 'Related Model', required: false })
        relatedModel: User;
    @RelatedModelList({ model: 'Comment', field: 'post', label: 'Related Model List' })
        relatedModelList: Comment[];

    constructor(data?: Partial<ModelWithAllFields>) {
        Object.assign(this, data);
    }
}