import * as rev from 'rev-models';

export const modelRegistry = new rev.ModelRegistry();
modelRegistry.registerBackend('default', new rev.InMemoryBackend());

export class User {
    @rev.IntegerField()
        id: number = 1;
    @rev.TextField()
        name: string = 'A Test Model';
    @rev.DateField()
        date_registered: Date = new Date();
}
modelRegistry.register(User);

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
}
modelRegistry.register(Post);

export const UserMeta = modelRegistry.getModelMeta('User');
export const PostMeta = modelRegistry.getModelMeta('Post');
