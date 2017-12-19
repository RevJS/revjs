import {
    ModelManager, InMemoryBackend, IModelMeta,
    IntegerField, TextField, DateField, BooleanField, DateTimeField
} from 'rev-models';

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());

export class User {
    @IntegerField()
        id: number = 1;
    @TextField()
        name: string = 'A Test Model';
    @DateField()
        date_registered: Date = new Date();

    userMethod1() {}
}
modelManager.register(User);

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

    postMethod1() {}
    postMethod2() {}
    postMethod3() {}
}
modelManager.register(Post);

export const UserMeta: IModelMeta<any> = modelManager.getModelMeta('User');
export const PostMeta: IModelMeta<any> = modelManager.getModelMeta('Post');
