import { ModelManager } from 'rev-models';
import { Post } from './models';

export interface IModelTestData {
    posts: Post[];
}

export async function getData(manager: ModelManager): Promise<IModelTestData> {

    const posts = [
        new Post({
            id: 1,
            title: 'RevJS v1.0.0 Released!',
            body: `Great news! RevJS has finally hit version 1!

Go download it now and use it for ALL TEH THINGS!`,
            published: false,
            post_date: '2018-01-31T12:11:10',
        }),
        new Post({
            id: 2,
            title: 'JavaScript is Awesome',
            body: `One language to rule them all...

My precious...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
        }),
        new Post({
            id: 3,
            title: 'Ruby Sucks',
            body: `Why do people use it?
... who knows!`,
            published: true,
            post_date: '2017-07-02T01:02:03',
        }),
        new Post({
            id: 4,
            title: 'Post 4',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
        }),
        new Post({
            id: 5,
            title: 'Post 5',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
        }),
        new Post({
            id: 6,
            title: 'Post 6',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
        }),
        new Post({
            id: 7,
            title: 'Post 7',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
        })
    ];

    for (const post of posts) {
        try {
            await manager.create(post);
        }
        catch (e) {
            console.log(post);
            console.log(e.result.validation.fieldErrors);
        }
    }

    return {
        posts
    };

}