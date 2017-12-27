
import * as d from '../../../decorators';

export class Company {
    @d.IntegerField({ primaryKey: true })
        id: number;
    @d.TextField()
        name: string;
    @d.RelatedModelList({ model: 'Department', field: 'company' })
        departments: Department[];
    @d.RelatedModelList({ model: 'Developer', field: 'company' })
        developers: Developer[];
    @d.RelatedModel({ model: 'Developer' })
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
    @d.RelatedModel({ model: 'Company' })
        company: Company;
    @d.RelatedModel({ model: 'City' })
        city: City;

    constructor(data?: Partial<Developer>) {
        Object.assign(this, data);
    }
}

export const testCompanyData = [
    {
        id: 1,
        name: 'AccelDev Inc.',
        leadDeveloper: 3
    },
    {
        id: 2,
        name: 'Programs R Us',
        leadDeveloper: 5
    },
    {
        id: 3,
        name: 'AwesomeSoft'
    },
];

export const testClientData = [
    {
        id: 1,
        name: 'Hannahs Hair Dressing'
    },
    {
        id: 2,
        name: 'Arnie',
    },
];

export const testCityData = [
    {
        id: 1,
        name: 'Wellington'
    },
    {
        id: 2,
        name: 'Auckland',
    },
];

export const testDeveloperData = [
    {
        id: 1,
        name: 'Billy Devman',
        company: 1,
        city: 1
    },
    {
        id: 2,
        name: 'Jane Programmer',
        company: 1,
        city: null
    },
    {
        id: 3,
        name: 'Nerdy McNerdface',
        company: 1,
        city: 2
    },
    {
        id: 4,
        name: 'Bilbo Baggins',
        company: 2,
        city: null
    },
    {
        id: 5,
        name: 'Captain JavaScript',
        company: 2,
        city: 1
    },
    {
        id: 6,
        name: 'Kim Jong Fail',
        company: null,
        city: 4  // deliberately non-matching
    },
];

export const testDepartmentData = [
    {
        id: 1,
        name: 'Front End Department',
        company: 1
    },
    {
        id: 2,
        name: 'Backend Department',
        company: 1
    },
    {
        id: 3,
        name: 'The Cheiftans',
        company: 2
    },
    {
        id: 4,
        name: 'Sales',
        company: 3
    },
    {
        id: 5,
        name: 'Research & Development',
        company: 3
    },
];