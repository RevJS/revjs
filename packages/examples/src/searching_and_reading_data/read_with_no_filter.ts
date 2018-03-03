
import { Post, modelManager, createData } from './models';

(async () => {
    await createData();

    const res = await modelManager.read(Post);

    for (let post of res.results) {
        console.log(post.title);
    }
})();
