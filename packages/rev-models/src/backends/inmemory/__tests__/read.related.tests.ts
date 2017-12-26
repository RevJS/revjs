
import { expect } from 'chai';

import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../backend';
import { ModelOperationResult } from '../../../operations/operationresult';
import { Company, Developer, testCompanyData, testDeveloperData } from './testdata.related';
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

    beforeEach(() => {
        manager = new ModelManager();
        backend = new InMemoryBackend();
        manager.registerBackend('default', backend);
        manager.register(Company);
        manager.register(Developer);
        companyReadResult = new ModelOperationResult<Company, IReadMeta>({operation: 'read'});
        developerReadResult = new ModelOperationResult<Developer, IReadMeta>({operation: 'read'});

        return backend.load(manager, Company, testCompanyData)
        .then(() => {
            return backend.load(manager, Developer, testDeveloperData);
        });
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
                        { id: 2, name: 'Programs R Us' }
                    ]);
                });
        });

    });

    describe('read() - with "related" option specifying a RelatedModel field with a single primary key', () => {

        it('returns results with RelatedModel field hydrated', () => {
            const expectedCompany1 = new Company(testCompanyData[0]);
            const expectedCompany2 = new Company(testCompanyData[1]);
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
                        { id: 6, name: 'Kim Jong Fail', company: expectedCompany2 }
                    ]);
                });
        });

    });

});
