
import * as d from '../../decorators';
import { IModelManager } from '../../models/types';

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

export const testCompanyData = [
    new Company({
        id: 1,
        name: 'AccelDev Inc.'
    }),
    new Company({
        id: 2,
        name: 'Programs R Us'
    }),
    new Company({
        id: 3,
        name: 'AwesomeSoft'
    }),
];

export const testCityData = [
    new City({
        id: 1,
        name: 'Wellington'
    }),
    new City({
        id: 2,
        name: 'Auckland',
    }),
];

export const testDeveloperData = [
    new Developer({
        id: 1,
        name: 'Billy Devman',
        company: testCompanyData[0],
        city: testCityData[0]
    }),
    new Developer({
        id: 2,
        name: 'Jane Programmer',
        company: testCompanyData[0],
        city: null
    }),
    new Developer({
        id: 3,
        name: 'Nerdy McNerdface',
        company: testCompanyData[0],
        city: testCityData[1]
    }),
    new Developer({
        id: 4,
        name: 'Bilbo Baggins',
        company: testCompanyData[1],
        city: null
    }),
    new Developer({
        id: 5,
        name: 'Captain JavaScript',
        company: testCompanyData[1],
        city: testCityData[0]
    }),
    new Developer({
        id: 6,
        name: 'Kim Jong Fail',
        company: null,
        city: new City({ id: 4, name: 'Non-existyville' })
    }),
];

export const testDepartmentData = [
    new Department({
        id: 1,
        name: 'Front End Department',
        company: testCompanyData[0]
    }),
    new Department({
        id: 2,
        name: 'Backend Department',
        company: testCompanyData[0]
    }),
    new Department({
        id: 3,
        name: 'The Cheiftans',
        company: testCompanyData[1]
    }),
    new Department({
        id: 4,
        name: 'Sales',
        company: testCompanyData[2]
    }),
    new Department({
        id: 5,
        name: 'Research & Development',
        company: testCompanyData[2]
    }),
];

export async function createRelatedTestData(manager: IModelManager) {
    try {
        for (let model of testCompanyData) {
            await manager.create(model);
        }
        for (let model of testCityData) {
            await manager.create(model);
        }
        for (let model of testDeveloperData) {
            await manager.create(model);
        }
        for (let model of testDepartmentData) {
            await manager.create(model);
        }

        // Set lead developers
        await manager.update(
            new Company({
                id: 1,
                leadDeveloper: testDeveloperData[2]
            }));
        await manager.update(
            new Company({
                id: 2,
                leadDeveloper: testDeveloperData[4]
            }));

    }
    catch (e) {
        if (e.result && e.result.validation) {
            console.log(e.result.validation);
            console.log(e.result.validation.fieldErrors);
        }
        throw e;
    }
}

export async function removeRelatedTestData(manager: IModelManager) {
    await manager.remove(Company, { where: {}});
    await manager.remove(City, { where: {}});
    await manager.remove(Developer, { where: {}});
    await manager.remove(Department, { where: {}});
}