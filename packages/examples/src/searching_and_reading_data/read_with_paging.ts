
import { Post, modelManager, createData } from './models';

(async () => {
    await createData();

    // Get the first 3 published posts
    const first3Posts = await modelManager.read(Post, {
        where: {
            published: true
        },
        offset: 0,
        limit: 3
    });
    console.log('First 3 Published Posts:', first3Posts.results);

    // Get the next 3 published posts
    const next3Posts = await modelManager.read(Post, {
        where: {
            published: true
        },
        offset: 3,
        limit: 3
    });
    console.log('Next 3 Posts:', next3Posts.results);

    // Just get all the published posts (max 100)
    const allPosts = await modelManager.read(Post, {
        where: {
            published: true
        },
        limit: 100
    });
    console.log('All Teh Posts:', allPosts.results);

})();
