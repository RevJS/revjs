
import {
    TextField, SelectField, ModelManager, InMemoryBackend,
    ValidationError
} from 'rev-models';

// Define model

export class Comment {
    @TextField()
        comment: string;
    @SelectField({ selection: [['draft', 'Draft'], ['posted', 'Posted']]})
        status: string;

    constructor(data?: Partial<Comment>) {
        Object.assign(this, data);
    }
}

const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(Comment);

// Try to create an invalid Comment

(async () => {

    try {
        await modelManager.create(new Comment({
            comment: 'This comment has an invalid status',
            status: 'Awesome!'
        }));
    }
    catch (e) {
        if (e instanceof ValidationError) {
            console.log('Model Failed Validation :(');
            console.log('Field Errors:', e.validation.fieldErrors);
            console.log('Model Errors:', e.validation.modelErrors);
        }
        else {
            throw e;
        }
    }

})();
