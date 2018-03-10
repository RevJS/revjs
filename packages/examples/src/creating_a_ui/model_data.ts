
import { ModelManager } from 'rev-models';
import { User, Post, Comment } from './models';

export async function createData(manager: ModelManager) {

    // Create Users

    const joe = (await manager.create(new User({
        username: 'joe123'
    }))).result;

    const bill = (await manager.create(new User({
        username: 'bill27'
    }))).result;

    const jane = (await manager.create(new User({
        username: 'jane12'
    }))).result;

    // Create Posts

    const post1 = (await manager.create(new Post({
        title: 'Cool post, served by rev-api',
        body: 'Heres some body text for the post',
        user: jane
    }))).result;

    const post2 = (await manager.create(new Post({
        title: 'The Rain in Spain',
        body: 'Really is a pain?',
        user: jane
    }))).result;

    // Create Comments

    await manager.create(new Comment({
        comment: 'True!',
        post: post1,
        user: bill
    }));

    await manager.create(new Comment({
        comment: 'Hmmm, but I reeeeaally like writing SQL...',
        post: post1,
        user: joe
    }));

    await manager.create(new Comment({
        comment: 'no comment',
        post: post2,
        user: bill
    }));

}