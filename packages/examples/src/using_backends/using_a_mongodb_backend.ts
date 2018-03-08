
import {
    AutoNumberField, TextField, IntegerField,
    ModelManager
} from 'rev-models';

import { MongoDBBackend } from 'rev-backend-mongodb';

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

(async () => {

    // Create a MongoDBBackend and connect to MongoDB

    const mongo = new MongoDBBackend({
        url: 'mongodb://localhost:27017',
        dbName: 'example_db'
    });
    await mongo.connect();

    // Create a ModelManager, and assign MongoDB as the default backend

    const modelManager = new ModelManager();
    modelManager.registerBackend('default', mongo);
    modelManager.register(TestModel);

    // Create some data, then disconnect afterwards

    await modelManager.create(new TestModel({
        name: 'data from RevJS!',
        description: 'This beautiful record was created by RevJS',
        score: 110
    }));
    console.log('Data successfully created in MongoDB!');

    await mongo.disconnect();

})();