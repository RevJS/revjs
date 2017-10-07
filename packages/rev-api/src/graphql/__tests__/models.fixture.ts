import * as rev from 'rev-models';

export const modelManager = new rev.ModelManager();
modelManager.registerBackend('default', new rev.InMemoryBackend());

export class User {
    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date_registered: Date = new Date();
    
    userMethod1() {}
}
modelManager.register(User);

export class Post {
    @rev.IntegerField()
        id: number = 10;
    @rev.TextField()
        title: string;
    @rev.TextField()
        body: string;
    @rev.BooleanField()
        published: boolean;
    @rev.DateTimeField()
        post_date: Date;

    postMethod1() {}
}
modelManager.register(Post);

export const UserMeta = modelManager.getModelMeta('User');
export const PostMeta = modelManager.getModelMeta('Post');
