
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { Company, Developer, testCompanyData, testDeveloperData, City, testCityData, Department, testDepartmentData } from './testdata.related';
import { DEFAULT_READ_OPTIONS } from '../../../operations/read';
import { IReadMeta } from '../../../models/types';

function getReadOpts(options?: object) {
    return Object.assign({}, DEFAULT_READ_OPTIONS, options);
}

describe('rev.backends.inmemory - read() related field tests', () => {

    let manager: ModelManager;
    let backend: InMemoryBackend;
    let companyReadResult: ModelOperationResult<Company, IReadMeta>;
    let developerReadResult: ModelOperationResult<Developer, IReadMeta>;

    beforeEach(async () => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(Company);
        manager.register(Developer);
        manager.register(City);
        manager.register(Department);
        companyReadResult = new ModelOperationResult<Company, IReadMeta>({operation: 'read'});
        developerReadResult = new ModelOperationResult<Developer, IReadMeta>({operation: 'read'});

        await backend.load(manager, Company, testCompanyData);
        await backend.load(manager, Developer, testDeveloperData);
        await backend.load(manager, City, testCityData);
        await backend.load(manager, Department, testDepartmentData);
    });

    describe('read() - without "related" option specified', () => {

        it('returns results without RelatedModel field data', () => {
            return backend.read(manager, Developer, {}, developerReadResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        { id: 1, name: 'Billy Devman' },
                        { id: 2, name: 'Jane Programmer'},
                        { id: 3, name: 'Nerdy McNerdface'},
                        { id: 4, name: 'Bilbo Baggins' },
                        { id: 5, name: 'Captain JavaScript'},
                        { id: 6, name: 'Kim Jong Fail'}
                    ]);
                });
        });

        it('returns results without RelatedModelList field data', () => {
            return backend.read(manager, Company, {}, companyReadResult, getReadOpts())
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        { id: 1, name: 'AccelDev Inc.' },
                        { id: 2, name: 'Programs R Us' },
                        { id: 3, name: 'AwesomeSoft' },
                    ]);
                });
        });

    });

    describe('read() - with "related" option specifying RelatedModel fields', () => {
        const expectedCompany1 = new Company({ id: 1, name: 'AccelDev Inc.' });
        const expectedCompany2 = new Company({ id: 2, name: 'Programs R Us' });
        const expectedCity1 = new City(testCityData[0]);
        const expectedCity2 = new Company(testCityData[1]);

        it('returns results with one RelatedModel field hydrated', () => {
            return backend.read(manager, Developer, {}, developerReadResult, getReadOpts({
                related: [ 'company' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        { id: 1, name: 'Billy Devman', company: expectedCompany1 },
                        { id: 2, name: 'Jane Programmer', company: expectedCompany1 },
                        { id: 3, name: 'Nerdy McNerdface', company: expectedCompany1 },
                        { id: 4, name: 'Bilbo Baggins', company: expectedCompany2 },
                        { id: 5, name: 'Captain JavaScript', company: expectedCompany2 },
                        { id: 6, name: 'Kim Jong Fail', company: null }
                    ]);
                });
        });

        it('returns results with two RelatedModel fields hydrated', () => {
            return backend.read(manager, Developer, {}, developerReadResult, getReadOpts({
                related: [ 'company', 'city' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        { id: 1, name: 'Billy Devman', company: expectedCompany1, city: expectedCity1 },
                        { id: 2, name: 'Jane Programmer', company: expectedCompany1, city: null  },
                        { id: 3, name: 'Nerdy McNerdface', company: expectedCompany1, city: expectedCity2  },
                        { id: 4, name: 'Bilbo Baggins', company: expectedCompany2, city: null  },
                        { id: 5, name: 'Captain JavaScript', company: expectedCompany2, city: expectedCity1  },
                        { id: 6, name: 'Kim Jong Fail', company: null, city: 4  }
                    ]);
                });
        });

        it('returns the plain foreign key value if it does not match a record', () => {
            return backend.read(manager, Developer, {
                id: 6
            }, developerReadResult, getReadOpts({
                related: [ 'city' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results[0]).to.deep.equal({
                        id: 6,
                        name: 'Kim Jong Fail',
                        city: 4
                    });
                });
        });

    });

    describe('read() - with "related" option specifying RelatedModelList fields', () => {

        it('returns results with one RelatedModelList field hydrated', () => {
            return backend.read(manager, Company, {}, companyReadResult, getReadOpts({
                related: [ 'developers' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        {
                            id: 1,
                            name: 'AccelDev Inc.',
                            developers: [
                                { id: 1, name: 'Billy Devman' },
                                { id: 2, name: 'Jane Programmer'},
                                { id: 3, name: 'Nerdy McNerdface' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Programs R Us',
                            developers: [
                                { id: 4, name: 'Bilbo Baggins' },
                                { id: 5, name: 'Captain JavaScript' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'AwesomeSoft',
                            developers: []
                        }
                    ]);
                });
        });

        it('returns results with two RelatedModelList fields hydrated', () => {
            return backend.read(manager, Company, {}, companyReadResult, getReadOpts({
                related: [ 'departments', 'developers' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        {
                            id: 1,
                            name: 'AccelDev Inc.',
                            departments: [
                                { id: 1, name: 'Front End Department'},
                                { id: 2, name: 'Backend Department' }
                            ],
                            developers: [
                                { id: 1, name: 'Billy Devman' },
                                { id: 2, name: 'Jane Programmer'},
                                { id: 3, name: 'Nerdy McNerdface' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Programs R Us',
                            departments: [
                                { id: 3, name: 'The Cheiftans'}
                            ],
                            developers: [
                                { id: 4, name: 'Bilbo Baggins' },
                                { id: 5, name: 'Captain JavaScript' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'AwesomeSoft',
                            departments: [
                                { id: 4, name: 'Sales'},
                                { id: 5, name: 'Research & Development'},
                            ],
                            developers: []
                        }
                    ]);
                });
        });
    });

    describe('read() - with "related" option specifying RelatedModel and RelatedModelList fields', () => {

        it('returns results with RelatedModel and RelatedModelList fields hydrated', () => {
            return backend.read(manager, Company, {}, companyReadResult, getReadOpts({
                related: [ 'developers', 'leadDeveloper' ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        {
                            id: 1,
                            name: 'AccelDev Inc.',
                            developers: [
                                { id: 1, name: 'Billy Devman' },
                                { id: 2, name: 'Jane Programmer'},
                                { id: 3, name: 'Nerdy McNerdface' }
                            ],
                            leadDeveloper: { id: 3, name: 'Nerdy McNerdface' }
                        },
                        {
                            id: 2,
                            name: 'Programs R Us',
                            developers: [
                                { id: 4, name: 'Bilbo Baggins' },
                                { id: 5, name: 'Captain JavaScript' }
                            ],
                            leadDeveloper: { id: 5, name: 'Captain JavaScript' }
                        },
                        {
                            id: 3,
                            name: 'AwesomeSoft',
                            developers: [],
                            leadDeveloper: null
                        }
                    ]);
                });
        });
    });

    describe('read() - with "related" option specifying fields multiple levels deep', () => {

        it('returns results with related data from all levels', () => {
            return backend.read(manager, Developer, {
                id: { _in: [1, 5] }
            }, developerReadResult, getReadOpts({
                related: [
                    'company.departments',
                    'company.departments.company',
                    'city',  ]
            }))
                .then((res) => {
                    expect(res.success).to.be.true;
                    expect(res.result).to.be.undefined;
                    expect(res.results).to.deep.equal([
                        {
                            id: 1,
                            name: 'Billy Devman',
                            city: { id: 1, name: 'Wellington' },
                            company: {
                                id: 1,
                                name: 'AccelDev Inc.',
                                departments: [
                                    {
                                        id: 1,
                                        name: 'Front End Department',
                                        company: {
                                            id: 1,
                                            name: 'AccelDev Inc.'
                                        }
                                    },
                                    {
                                        id: 2,
                                        name: 'Backend Department',
                                        company: {
                                            id: 1,
                                            name: 'AccelDev Inc.'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            id: 5,
                            name: 'Captain JavaScript',
                            city: { id: 1, name: 'Wellington' },
                            company: {
                                id: 2,
                                name: 'Programs R Us',
                                departments: [
                                    {
                                        id: 3,
                                        name: 'The Cheiftans',
                                        company: {
                                            id: 2,
                                            name: 'Programs R Us',
                                        }
                                    }
                                ]
                            }
                        }
                    ]);
                });
        });
    });

});
