import { ModelManager } from 'rev-models';
import { Post, User, Comment } from './models';

export interface IModelTestData {
    users: User[];
    posts: Post[];
    comments: Comment[];
}

export async function createData(manager: ModelManager): Promise<IModelTestData> {

    const users = [
        new User({
            id: 1,
            name: 'Billy Bob',
            date_registered: '2012-03-20'
        }),
        new User({
            id: 2,
            name: 'Mike Portnoy',
            date_registered: '2017-10-02'
        })
    ];

    const posts = [
        new Post({
            id: 1,
            title: 'RevJS v1.0.0 Released!',
            body: `Great news! RevJS has finally hit version 1!

Go download it now and use it for ALL TEH THINGS!`,
            published: false,
            post_date: '2018-01-31T12:11:10',
            user: users[0]
        }),
        new Post({
            id: 2,
            title: 'JavaScript is Awesome',
            body: `One language to rule them all...

My precious...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
            user: users[0]
        }),
        new Post({
            id: 3,
            title: 'Ruby Sucks',
            body: `Why do people use it?
... who knows!`,
            published: true,
            post_date: '2017-07-02T01:02:03',
            user: users[1]
        }),
        new Post({
            id: 4,
            title: 'Post 4',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
            user: users[0]
        }),
        new Post({
            id: 5,
            title: 'Post 5',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
            user: users[0]
        }),
        new Post({
            id: 6,
            title: 'Post 6',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
            user: users[0]
        }),
        new Post({
            id: 7,
            title: 'Post 7',
            body: `Another post...`,
            published: true,
            post_date: '2017-04-15T13:14:15',
            user: users[0]
        })
    ];

    const comments = [
        new Comment({
            id: 1,
            post: posts[0],
            comment: 'I totally agree',
            user: users[1]
        }),
        new Comment({
            id: 2,
            post: posts[0],
            comment: 'Sweet!',
            user: users[0]
        }),
    ];

    for (const user of users) {
        try {
            await manager.create(user);
        }
        catch (e) {
            console.log(user);
            console.log(e.result.validation.fieldErrors);
        }
    }

    for (const post of posts) {
        try {
            await manager.create(post);
        }
        catch (e) {
            console.log(post);
            console.log(e.result.validation.fieldErrors);
        }
    }

    for (const comment of comments) {
        try {
            await manager.create(comment);
        }
        catch (e) {
            console.log(comment);
            console.log(e.result.validation.fieldErrors);
        }
    }

    return {
        users,
        posts,
        comments
    };

}