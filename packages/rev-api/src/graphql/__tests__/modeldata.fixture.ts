import { ModelManager } from 'rev-models';
import { Post } from './models.fixture';

export async function createPosts(manager: ModelManager) {

    const posts = [
        new Post({
            id: 1,
            title: 'RevJS v1.0.0 Released!',
            body: `Great news! RevJS has finally hit version 1!

Go download it now and use it for ALL TEH THINGS!`,
            published: false,
            post_date: '2018-01-31T12:11:10'
        }),
        new Post({
            id: 2,
            title: 'JavaScript is Awesome',
            body: `One language to rule them all...

My precious...`,
            published: true,
            post_date: '2017-04-15T13:14:15'
        }),
        new Post({
            id: 3,
            title: 'Ruby Sucks',
            body: `Why do people use it?
... who knows!`,
            published: true,
            post_date: '2017-07-02T01:02:03'
        })
    ];

    for (const post of posts) {
        await manager.create(post);
    }

    return posts;

}