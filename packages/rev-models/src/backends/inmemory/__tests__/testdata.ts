
import { Model } from '../../../models/model';
import * as d from '../../../decorators';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

export class TestModel extends Model {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
    @d.IntegerField({ required: false })
        age: number;
    @d.SelectionField({ required: false, selection: GENDERS })
        gender: string;
    @d.BooleanField({ required: false })
        newsletter: boolean;
    @d.DateField({ required: false })
        date_registered: Date;

    getDescription?() {
        return `${this.name}, age ${this.age}`;
    }
}

export const testData: Array<Partial<TestModel>> = [
    {
        id: 0,
        name: 'John Doe',
        age: 20,
        gender: 'male',
        newsletter: true,
        date_registered: new Date('2016-05-26')
    },
    {
        id: 1,
        name: 'Jane Doe',
        age: 23,
        gender: 'female',
        newsletter: true,
        date_registered: new Date('2017-01-01')
    },
    {
        id: 2,
        name: 'Felix The Cat',
        age: 3,
        gender: 'male',
        newsletter: false,
        date_registered: new Date('2016-12-03')
    },
    {
        id: 3,
        name: 'Rambo',
        age: 45,
        gender: 'male',
        newsletter: true,
        date_registered: new Date('2015-06-11')
    },
    {
        id: 4,
        name: 'Frostella the Snowlady',
        age: 28,
        gender: 'female',
        newsletter: false,
        date_registered: new Date('2016-12-25')
    }
];
