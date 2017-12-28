import {
    fields, ModelManager, InMemoryBackend,
    IntegerField, TextField, DateField, BooleanField, DateTimeField,
    AutoNumberField, NumberField, SelectionField, TimeField,
    RelatedModel, RelatedModelList
} from 'rev-models';

export class User {
    @IntegerField({ primaryKey: true })
        id: number = 1;
    @TextField()
        name: string = 'A Test Model';
    @DateField()
        date_registered: string = '2017-12-01';
    @RelatedModelList({ model: 'Post', field: 'user' })
        posts: Post[];

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    userMethod1() {}
}

export class Post {
    @IntegerField({ primaryKey: true })
        id: number = 10;
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

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }

    postMethod1() {}
    postMethod2() {}
    postMethod3() {}
}

export class UnknownField extends fields.Field {}

export class ModelWithUnknownField {
    unknownField: string;
    @IntegerField()
        id: number = 1;
    @TextField()
        name: string = 'A test model with a weird field type';

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    userMethod1() {}
}

export class ModelWithAllScalarFields {
    @AutoNumberField()
        autoNumberField: number;
    @IntegerField()
        integerField: number = 2;
    @NumberField()
        numberField: number = 3.456;
    @TextField()
        textField: string = 'A test model with all default field types';
    @BooleanField()
        booleanField: boolean = true;
    @SelectionField({ selection: [['Y', 'Yes'], ['N', 'No']] })
        selectionField: string = 'Y';
    @DateField()
        dateField: string = '2017-12-25';
    @TimeField()
        timeField: string = '12:13:14';
    @DateTimeField()
        dateTimeField: string = '2017-12-25T12:13:14';

    constructor(data?: Partial<User>) {
        Object.assign(this, data);
    }

    userMethod1() {}
}

export function getModelManager() {
    const modelManager = new ModelManager();
    modelManager.registerBackend('default', new InMemoryBackend());
    modelManager.register(User);
    modelManager.register(Post);
    modelManager.register(ModelWithUnknownField, { fields: [
        new UnknownField('unknownField')
    ]});
    modelManager.register(ModelWithAllScalarFields);
    return modelManager;
}
