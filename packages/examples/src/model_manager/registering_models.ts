
import { TextField, ModelManager, InMemoryBackend } from 'rev-models';

// Define models

export class User {
    @TextField()
        first_name: string;
    @TextField()
        last_name: string;
}

export class Post {
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;
}

// Create ModelManager and register the models

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());

modelManager.register(User);
modelManager.register(Post);
