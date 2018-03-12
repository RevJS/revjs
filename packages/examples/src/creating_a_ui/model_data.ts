
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
        title: 'Programmer',
        body: 'Nader-Monahan',
        user: jane
    }))).result;

    const post2 = (await manager.create(new Post({
        title: 'Design Engineer',
        body: 'Hyatt Group',
        user: bill
    }))).result;

    await manager.create(new Post({
        title: 'VP Sales',
        body: 'Senger-Hoeger',
        user: jane
    }));

    await manager.create(new Post({
        title: 'VP Operations',
        body: 'Schamberger-Orn',
        user: joe
    }));

    await manager.create(new Post({
        title: 'Administrative Assistant',
        body: 'Hammes-Dooley',
        user: jane
    }));

    await manager.create(new Post({
        title: 'Tax Accountant',
        body: 'Corkery, Wyman and Brekke',
        user: bill
    }));

    await manager.create(new Post({
        title: 'Food Chemist',
        body: 'Friesen-Reichel',
        user: joe
    }));

    await manager.create(new Post({
        title: 'GIS Technical Architect',
        body: 'Hyatt-Goyette',
        user: joe
    }));

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