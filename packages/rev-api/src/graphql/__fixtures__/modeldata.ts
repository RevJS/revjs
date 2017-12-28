import { ModelManager } from 'rev-models';
import { Post, User } from './models';

export interface IModelTestData {
    users: User[];
    posts: Post[];
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
        })
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

    return {
        users,
        posts
    };

}