
import { IModelManager } from '../../models/types';
import { TestModel, TestModelNoPK } from './models';

export const testData = [
    new TestModel({
        id: 0,
        name: 'John Doe',
        age: 20,
        gender: 'male',
        newsletter: true,
        date_registered: '2016-05-26'
    }),
    new TestModel({
        id: 1,
        name: 'Jane Doe',
        age: 23,
        gender: 'female',
        newsletter: true,
        date_registered: '2017-01-01'
    }),
    new TestModel({
        id: 2,
        name: 'Felix The Cat',
        age: 3,
        gender: 'male',
        newsletter: false,
        date_registered: '2016-12-03'
    }),
    new TestModel({
        id: 3,
        name: 'Rambo',
        age: 45,
        gender: 'male',
        newsletter: true,
        date_registered: '2015-06-11'
    }),
    new TestModel({
        id: 4,
        name: 'Frostella the Snowlady',
        age: 28,
        gender: 'female',
        newsletter: false,
        date_registered: '2016-12-25'
    })
];

export const testDataNoPK = [
    new TestModelNoPK({
        name: 'record1',
        description: 'This is the first record'
    }),
    new TestModelNoPK({
        name: 'record2',
        description: 'This is the second record'
    }),
    new TestModelNoPK({
        name: 'record3',
        description: 'And here is a third!'
    }),
];

export async function createTestData(manager: IModelManager) {
    for (let model of testData) {
        await manager.create(model);
    }
    for (let model of testDataNoPK) {
        await manager.create(model);
    }
}

export async function removeTestData(manager: IModelManager) {
    await manager.remove(TestModel, { where: {}});
    await manager.remove(TestModelNoPK, { where: {}});
}