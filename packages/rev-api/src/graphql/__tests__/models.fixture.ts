import { ModelRegistry } from 'rev-models/lib/registry';
import * as f from 'rev-models/lib/decorators';

export const modelRegistry = new ModelRegistry();

export class User {
    @f.IntegerField()
        id: number = 1;
    @f.TextField()
        name: string = 'A Test Model';
    @f.DateField()
        date_registered: Date = new Date();
}
modelRegistry.register(User);

export class Post {
    @f.IntegerField()
        id: number = 10;
    @f.TextField()
        title: string;
    @f.TextField()
        body: string;
    @f.BooleanField()
        published: boolean;
    @f.DateTimeField()
        post_date: Date;
}
modelRegistry.register(Post);

export const UserMeta = modelRegistry.getMeta('User');
export const PostMeta = modelRegistry.getMeta('Post');
