
import {
    AutoNumberField, TextField, IntegerField,
    ModelManager
} from 'rev-models';

import { ModelApiBackend } from 'rev-api-client';

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

// Create a ModelApiBackend, which consumes a rev-api GraphQL API at /api
const apiBackend = new ModelApiBackend('/api');

// Create the ModelManager and register the backnd and a model
const modelManager = new ModelManager();
modelManager.registerBackend('default', apiBackend);
modelManager.register(TestModel);
