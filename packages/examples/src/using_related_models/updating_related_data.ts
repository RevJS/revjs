
import { User, Post, Comment, modelManager } from './creating_related_models';
import { createData } from './creating_related_data';

(async () => {
    await createData();

    // Get the first post
    const post1 = (await modelManager.read(Post, { limit: 1 })).results[0];

    // Get the first user
    const user1 = (await modelManager.read(User, { limit: 1 })).results[0];

    // Make user1 the author of post1
    post1.user = user1;
    await modelManager.update(post1);

    // If we know the ID of the record we want to link, we can pass a new
    // model instance containing the related ID:
    post1.user = new User({ id: 2 });
    await modelManager.update(post1);

    // To un-link a model, set the RelatedModel field to null
    const comment1 = (await modelManager.read(Comment, { limit: 1 })).results[0];
    comment1.user = null;
    await modelManager.update(comment1);

})();