
import { Post, modelManager, createData } from './models';

(async () => {
    await createData();

    // Read all published posts, sorted by Title
    const postsByTitle = await modelManager.read(Post, {
        where: {
            published: true
        },
        limit: 100,
        orderBy: ['title']
    });
    console.log('Posts by Title:', postsByTitle.results);

    // Read all posts, sorted by Title in descending order
    const postsByTitleDesc = await modelManager.read(Post, {
        limit: 100,
        orderBy: ['title desc']
    });
    console.log('Posts by Titie in descending order:', postsByTitleDesc.results);

    // Read the first 10 posts sorted by Rating, then by Title
    const top10Posts = await modelManager.read(Post, {
        limit: 10,
        orderBy: ['rating desc', 'title']
    });
    console.log('Top Posts:', top10Posts.results);

})();
