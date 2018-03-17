
import * as d from '../../decorators';
import { ModelManager } from '../../models/manager';

let GENDERS = [
    ['male', 'Male'],
    ['female', 'Female']
];

export class TestModel {
    @d.AutoNumberField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
    @d.IntegerField({ required: false })
        age: number;
    @d.SelectField({ required: false, selection: GENDERS })
        gender: string;
    @d.BooleanField({ required: false })
        newsletter: boolean;
    @d.DateField({ required: false })
        date_registered: string;

    getDescription?() {
        return `${this.name}, age ${this.age}`;
    }

    constructor(data?: Partial<TestModel>) {
        Object.assign(this, data);
    }
}

export class TestModelNoPK {
    @d.TextField()
        name: string;
    @d.TextField()
        description: string;

    constructor(data?: Partial<TestModelNoPK>) {
        Object.assign(this, data);
    }
}

export class TestAutoNumberModel {
    @d.AutoNumberField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;

    constructor(data?: Partial<TestAutoNumberModel>) {
        Object.assign(this, data);
    }
}

export class Company {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
    @d.RelatedModelList({ model: 'Department', field: 'company' })
        departments: Department[];
    @d.RelatedModelList({ model: 'Developer', field: 'company' })
        developers: Developer[];
    @d.RelatedModel({ model: 'Developer', required: false })
        leadDeveloper: Developer;

    constructor(data?: Partial<Company>) {
        Object.assign(this, data);
    }
}

export class Department {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.RelatedModel({ model: 'Company' })
        company: Company;
    @d.TextField()
        name: string;

    constructor(data?: Partial<Department>) {
        Object.assign(this, data);
    }
}

export class City {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;

    constructor(data?: Partial<City>) {
        Object.assign(this, data);
    }
}

export class Developer {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
    @d.RelatedModel({ model: 'Company', required: false })
        company: Company;
    @d.RelatedModel({ model: 'City', required: false })
        city: City;

    constructor(data?: Partial<Developer>) {
        Object.assign(this, data);
    }
}

export function registerModels(manager: ModelManager) {
    manager.register(TestModel);
    manager.register(TestModelNoPK);
    manager.register(TestAutoNumberModel);
    manager.register(Company);
    manager.register(Department);
    manager.register(City);
    manager.register(Developer);
}
