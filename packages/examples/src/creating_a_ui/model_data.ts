
import { ModelManager } from 'rev-models';
import { User, Post, Comment } from './models';

export async function createData(manager: ModelManager) {

    // Create Users

    const joe = (await manager.create(new User({
        username: 'joe123',
        first_name: 'Joe',
        last_name: 'Mahony'
    }))).result;

    const bill = (await manager.create(new User({
        username: 'bill27',
        first_name: 'Bill',
        last_name: 'Biddington'
    }))).result;

    const jane = (await manager.create(new User({
        username: 'jane12',
        first_name: 'Jane',
        last_name: 'Foster'
    }))).result;

    // Create Posts

    const post1 = (await manager.create(new Post({
        post_date: '2018-03-18',
        title: 'Programmer',
        description: 'Nader-Monahan, Rebum brute est.',
        user: jane
    }))).result;

    const post2 = (await manager.create(new Post({
        post_date: '2018-02-23',
        title: 'Design Engineer',
        description: 'Hyatt Group, vel utroque constituam.',
        user: bill
    }))).result;

    await manager.create(new Post({
        post_date: '2017-11-08',
        title: 'VP Sales',
        description: 'Senger-Hoeger, ad quas patrioque eloquentiam.',
        user: jane
    }));

    await manager.create(new Post({
        post_date: '2018-01-01',
        title: 'VP Operations',
        description: 'Schamberger-Orn, ea malis graeco copiosae.',
        user: joe
    }));

    await manager.create(new Post({
        post_date: '2018-01-15',
        title: 'Administrative Assistant',
        description: 'Hammes-Dooley, eum in labitur dignissim.',
        user: jane
    }));

    await manager.create(new Post({
        post_date: '2018-02-03',
        title: 'Tax Accountant',
        description: 'Corkery, Wyman and Brekke',
        user: bill
    }));

    await manager.create(new Post({
        post_date: '2017-12-20',
        title: 'Food Chemist',
        description: 'Friesen-Reichel, modo eius ut eos.',
        user: joe
    }));

    await manager.create(new Post({
        post_date: '2018-03-05',
        title: 'GIS Technical Architect',
        description: 'Hyatt-Goyette, utamur corrumpit ea sed.',
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