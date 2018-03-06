import { expect } from 'chai';
import { TextField, ModelManager, InMemoryBackend } from 'rev-models';
import { convertQuery } from '../query';

class TestModel {
    @TextField()
        test: string;
}

interface IQuerySpec {
    revjs: object;
    mongo: object;
}

const QUERIES: IQuerySpec[] = [
    {
        revjs: {},
        mongo: {}
    },
    {
        revjs: {
            test: 1
        },
        mongo: {
            test: { $eq: 1 }
        }
    },
];

describe.only('MongoDB convertQuery()', () => {
    let manager: ModelManager;

    before(() => {
        manager = new ModelManager();
        manager.registerBackend('default', new InMemoryBackend());
        manager.register(TestModel);
    });

    function compareQuery(query: IQuerySpec) {
        expect(convertQuery(manager, TestModel, query.revjs))
            .to.deep.equal(query.mongo);
    }

    QUERIES.forEach((query) => {
        it('converts query as expected: ' + JSON.stringify(query.revjs), () => {
            compareQuery(query);
        });
    });

});
