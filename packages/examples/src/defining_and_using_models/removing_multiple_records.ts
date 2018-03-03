import { Post, modelManager, createData } from './post_model';

(async () => {
    await createData();

    // Count unpublished posts
    const unpublishedPosts = await modelManager.read(Post, {
        where: {
            published: false
        }
    });
    console.log('Number of unpublished posts:', unpublishedPosts.meta.totalCount);

    // Delete all unpublished posts
    const deleteResult = await modelManager.remove(new Post(), {
        where: {
            published: false
        }
    });
    console.log('Deleted records:', deleteResult.meta.totalCount);

})();
