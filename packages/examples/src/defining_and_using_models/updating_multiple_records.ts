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

    // Publish all unpublished posts!
    const publishResult = await modelManager.update(
        new Post({
            published: true
        }),
        {
            where: {
                published: false
            }
        }
    );
    console.log('Updated records:', publishResult.meta.totalCount);

})();
