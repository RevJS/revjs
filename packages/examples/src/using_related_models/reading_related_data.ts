
import { User, Post, Comment, modelManager } from './creating_related_models';
import { createData } from './creating_related_data';

(async () => {
    await createData();

    // Read all posts (without related data)
    const plainPosts = await modelManager.read(Post);
    console.log('Plain posts:', plainPosts.results);

    // Read all posts, including the 'user' field
    const posts2 = await modelManager.read(Post, {
        related: ['user']
    });
    console.log('Posts with User:', posts2.results);

    // Read all posts, including the 'user' and 'comments'
    const posts3 = await modelManager.read(Post, {
        related: ['user', 'comments']
    });
    console.log('Posts with User and Comments:', posts3.results);

    // Read all posts, including the 'user', 'comments' and 'comments.user'
    const posts4 = await modelManager.read(Post, {
        related: ['user', 'comments.user']
    });
    console.log('Posts with User, Comments and Comment Author:', posts3.results);

})();