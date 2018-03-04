
import { User, Post, Comment, modelManager } from './defining_an_api';

export async function createData() {

    // Create Users

    const joe = (await modelManager.create(new User({
        username: 'joe123'
    }))).result;

    const bill = (await modelManager.create(new User({
        username: 'bill27'
    }))).result;

    const jane = (await modelManager.create(new User({
        username: 'jane12'
    }))).result;

    // Create Posts

    const post1 = (await modelManager.create(new Post({
        title: 'Cool post, served by rev-api',
        body: 'Heres some body text for the post',
        user: jane
    }))).result;

    const post2 = (await modelManager.create(new Post({
        title: 'The Rain in Spain',
        body: 'Really is a pain?',
        user: jane
    }))).result;

    // Create Comments

    await modelManager.create(new Comment({
        comment: 'True!',
        post: post1,
        user: bill
    }));

    await modelManager.create(new Comment({
        comment: 'Hmmm, but I reeeeaally like writing SQL...',
        post: post1,
        user: joe
    }));

    await modelManager.create(new Comment({
        comment: 'no comment',
        post: post2,
        user: bill
    }));

}