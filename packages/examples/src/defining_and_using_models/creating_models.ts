
import {
    AutoNumberField, TextField, SelectField, IntegerField,
    RelatedModel, ModelManager, InMemoryBackend
} from 'rev-models';

// Define models

export class City {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        name: string;

    constructor(data?: Partial<City>) {
        Object.assign(this, data);
    }
}

export class Customer {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField()
        first_name: string;
    @TextField()
        last_name: string;
    @IntegerField()
        age: number;
    @SelectField({ selection: [['M', 'Male'], ['F', 'Female']] })
        gender: string;
    @RelatedModel({ model: 'City', required: false })
        city: City;

    constructor(data?: Partial<Customer>) {
        Object.assign(this, data);
    }
}

// Create ModelManager and register the models

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());

modelManager.register(City);
modelManager.register(Customer);
