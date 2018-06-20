
import { ModelManager } from 'rev-models';
import { User, Post, Comment, ModelWithAllFields } from './models';

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
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.',
        user: jane,
        status: 'published'
    }))).result;

    const post2 = (await manager.create(new Post({
        post_date: '2018-02-23',
        title: 'Design Engineer',
        description: 'Hyatt Group, vel utroque constituam.',
        body: 'Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.',
        user: bill,
        status: 'published'
    }))).result;

    await manager.create(new Post({
        post_date: '2017-11-08',
        title: 'VP Sales',
        description: 'Senger-Hoeger, ad quas patrioque eloquentiam.',
        body: 'Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.',
        user: jane,
        status: 'published'
    }));

    await manager.create(new Post({
        post_date: '2018-01-01',
        title: 'VP Operations',
        description: 'Schamberger-Orn, ea malis graeco copiosae.',
        body: 'Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum.',
        user: joe,
        status: 'published'
    }));

    await manager.create(new Post({
        post_date: '2018-01-15',
        title: 'Administrative Assistant',
        description: 'Hammes-Dooley, eum in labitur dignissim.',
        body: 'Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam.',
        user: jane,
        status: 'published'
    }));

    await manager.create(new Post({
        post_date: '2018-02-03',
        title: 'Tax Accountant',
        description: 'Corkery, Wyman and Brekke',
        body: 'Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.',
        user: bill,
        status: 'published'
    }));

    await manager.create(new Post({
        post_date: '2017-12-20',
        title: 'Food Chemist',
        description: 'Friesen-Reichel, modo eius ut eos.',
        body: 'Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue.',
        user: joe,
        status: 'draft'
    }));

    await manager.create(new Post({
        post_date: '2018-03-05',
        title: 'GIS Technical Architect',
        description: 'Hyatt-Goyette, utamur corrumpit ea sed.',
        body: 'Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue.',
        user: joe,
        status: 'draft'
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

    // Create sample data for ModelWithAllFields

    await manager.create(new ModelWithAllFields({
        textField: 'some text',
        multilineTextField: 'some text\nover multiple lines',
        emailField: 'bob@bob.com',
        urlField: 'https://bob.com/',
        passwordField: 'password1234',
        numberField: 22.33,
        integerField: 123,
        // autoNumberField: 1,
        booleanField: true,
        selectField: 'draft',
        multiSelectField: ['draft'],
        dateField: '2018-05-01',
        timeField: '10:00:00',
        dateTimeField: '2018-05-02T10:11:12',
        relatedModel: bill,
        // relatedModelList: Comment[];
    }));

    await manager.create(new ModelWithAllFields({
        textField: 'other text',
        multilineTextField: 'other text\nover multiple lines',
        emailField: 'john@bob.com',
        urlField: 'https://bob.com/',
        passwordField: '123456!',
        numberField: 1.234,
        integerField: -12,
        // autoNumberField: 1,
        booleanField: false,
        selectField: 'published',
        multiSelectField: ['draft', 'published'],
        dateField: '2019-01-02',
        timeField: '22:00:00',
        dateTimeField: '2019-01-02T22:11:00',
        relatedModel: joe,
        // relatedModelList: Comment[];
    }));

}