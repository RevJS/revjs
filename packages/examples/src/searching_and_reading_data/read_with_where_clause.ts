
import { Post, modelManager, createData } from './models';

(async () => {
    await createData();

    // Find all posts in the 'technology' category that are published
    const techPosts = await modelManager.read(Post, {
        where: {
            category: 'technology',
            published: true
        }
    });
    console.log('Tech Posts:', techPosts.results);

    // Find all published posts in the 'science' OR 'technology' categories
    const sciTechPosts = await modelManager.read(Post, {
        where: {
            _or: [
                { category: 'science' },
                { category: 'technology' }
            ],
            published: true
        }
    });
    console.log('Science & Technology Posts:', sciTechPosts.results);

    // Find all posts with a rating greater than or equal to 3
    const goodPosts = await modelManager.read(Post, {
        where: {
            rating: { _gte: 3 }
        }
    });
    console.log('Good Posts:', goodPosts.results);

})();
