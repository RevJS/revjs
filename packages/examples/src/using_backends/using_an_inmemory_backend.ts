
import {
    AutoNumberField, TextField, IntegerField,
    ModelManager, InMemoryBackend
} from 'rev-models';

class TestModel {
    @AutoNumberField({ primaryKey: true })
        item_number: number;
    @TextField()
        name: string;
    @TextField({ required: false })
        description: string;
    @IntegerField()
        score: number;

    constructor(data: Partial<TestModel>) {
        Object.assign(this, data);
    }
}

// Create a ModelManager with an InMemoryBackend
const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(TestModel);
