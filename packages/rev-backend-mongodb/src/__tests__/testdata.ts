
import * as rev from 'rev-models';
import { Db } from 'mongodb';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

export class TestModel {
    @rev.AutoNumberField({ primaryKey: true })
        id: number;
    @rev.TextField()
        name: string;
    @rev.IntegerField({ required: false })
        age: number;
    @rev.SelectField({ required: false, selection: GENDERS })
        gender: string;
    @rev.BooleanField({ required: false })
        newsletter: boolean;
    @rev.DateField({ required: false })
        date_registered: Date;

    getDescription?() {
        return `${this.name}, age ${this.age}`;
    }
}

export const testData = [
    {
        id: 0,
        name: 'John Doe',
        age: 20,
        gender: 'male',
        newsletter: true,
        date_registered: '2016-05-26'
    },
    {
        id: 1,
        name: 'Jane Doe',
        age: 23,
        gender: 'female',
        newsletter: true,
        date_registered: '2017-01-01'
    },
    {
        id: 2,
        name: 'Felix The Cat',
        age: 3,
        gender: 'male',
        newsletter: false,
        date_registered: '2016-12-03'
    },
    {
        id: 3,
        name: 'Rambo',
        age: 45,
        gender: 'male',
        newsletter: true,
        date_registered: '2015-06-11'
    },
    {
        id: 4,
        name: 'Frostella the Snowlady',
        age: 28,
        gender: 'female',
        newsletter: false,
        date_registered: '2016-12-25'
    }
];

export async function clearTestData(mongoDB: Db) {
    try {
        await mongoDB.collection('TestModel').drop();
    }
    catch (e) { }
}