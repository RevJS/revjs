
import { User, Post, Comment, modelManager } from './creating_related_models';

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
        title: 'Related Data in RevJS',
        body: 'Pretty easy to do eh?',
        user: jane
    }))).result;

    await modelManager.create(new Post({
        title: 'The Rain in Spain',
        body: 'Really is a pain?',
        user: jane
    }));

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

}