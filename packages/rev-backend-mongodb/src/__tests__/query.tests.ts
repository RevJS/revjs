import { expect } from 'chai';
import { TextField, ModelManager, InMemoryBackend, NumberField } from 'rev-models';
import { convertQuery } from '../query';

class TestModel {
    @TextField()
        testString: string;
    @NumberField()
        testNumber: string;
}

interface IQuerySpec {
    revjs: object;
    mongo: object;
}

const QUERIES: IQuerySpec[] = [

    // Empty Query

    {
        revjs: {},
        mongo: {}
    },

    // AND tests

    {
        revjs: {
            testNumber: 1
        },
        mongo: {
            testNumber: { $eq: 1 }
        }
    },
    {
        revjs: {
            testNumber: 1,
            testString: 'test'
        },
        mongo: {
            $and: [
                { testNumber: { $eq: 1 }},
                { testString: { $eq: 'test' }}
            ]
        }
    },
    {
        revjs: {
            _and: [
                { testNumber: 1 },
                { testString: 'test' },
                { testString: 'something' }
            ]
        },
        mongo: {
            $and: [
                { testNumber: { $eq: 1 }},
                { testString: { $eq: 'test' }},
                { testString: { $eq: 'something' }},
            ]
        }
    },

    // OR Tests

    {
        revjs: {
            _or: [
                { testNumber: 1 }
            ]
        },
        mongo: {
            $or: [
                { testNumber: { $eq: 1 }},
            ]
        }
    },
    {
        revjs: {
            _or: [
                { testNumber: 1 },
                { testString: 'test' },
            ]
        },
        mongo: {
            $or: [
                { testNumber: { $eq: 1 }},
                { testString: { $eq: 'test' }},
            ]
        }
    },
    {
        revjs: {
            _or: [
                { testNumber: 1 },
                { testNumber: 2 },
                { testString: 'test' },
            ]
        },
        mongo: {
            $or: [
                { testNumber: { $eq: 1 }},
                { testNumber: { $eq: 2 }},
                { testString: { $eq: 'test' }},
            ]
        }
    },

    // Multi ValueOperator + nested OR

    {
        revjs: {
            testNumber: { _gt: 0, _lt: 10 },
            _or: [
                { testString: 'test1' },
                { testString: 'test2' }
            ]
        },
        mongo: {
            $and: [
                { testNumber: { $gt: 0, $lt: 10 }},
                { $or: [
                    { testString: { $eq: 'test1' }},
                    { testString: { $eq: 'test2' }}
                ]}
            ]
        }
    },

    // Multi ValueOperator + nested AND

    {
        revjs: {
            _or: [
                { testNumber: { _gt: 0, _lt: 10 }},
                { _and: [
                    { testString: 'test1' },
                    { testString: 'test2' }
                ]}
            ]
        },
        mongo: {
            $or: [
                { testNumber: { $gt: 0, $lt: 10 }},
                { $and: [
                    { testString: { $eq: 'test1' }},
                    { testString: { $eq: 'test2' }}
                ]}
            ]
        }
    },

    // Tests for each field operator

    {
        revjs: {
            testString: { _eq: 'test' }
        },
        mongo: {
            testString: { $eq: 'test' }
        }
    },
    {
        revjs: {
            testString: { _eq: 'test', _ne: 'blah' }
        },
        mongo: {
            testString: { $eq: 'test', $ne: 'blah' }
        }
    },
    {
        revjs: {
            testNumber: { _gt: 10 }
        },
        mongo: {
            testNumber: { $gt: 10 }
        }
    },
    {
        revjs: {
            testNumber: { _gte: 10 }
        },
        mongo: {
            testNumber: { $gte: 10 }
        }
    },
    {
        revjs: {
            testNumber: { _lt: 10 }
        },
        mongo: {
            testNumber: { $lt: 10 }
        }
    },
    {
        revjs: {
            testNumber: { _lte: 10 }
        },
        mongo: {
            testNumber: { $lte: 10 }
        }
    },
    {
        revjs: {
            testNumber: { _in: [1, 2, 3] }
        },
        mongo: {
            testNumber: { $in: [1, 2, 3] }
        }
    },
    {
        revjs: {
            testNumber: { _nin: [1, 2, 3] }
        },
        mongo: {
            testNumber: { $nin: [1, 2, 3] }
        }
    },
];

describe('MongoDB convertQuery()', () => {
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

    it('throws when query does not match object', () => {
        expect(() => {
            convertQuery(manager, TestModel, {
                nonExistingField: 12
            });
        }).to.throw(`'nonExistingField' is not a recognised field or conjunction operator`);
    });

    QUERIES.forEach((query) => {
        it('converts query as expected: ' + JSON.stringify(query.revjs), () => {
            compareQuery(query);
        });
    });

    [
        ['test', '/^test$/im'],
        ['%test', '/^.*test$/im'],
        ['test%', '/^test.*$/im'],
        ['%test%', '/^.*test.*$/im'],
        ['%test%test%', '/^.*test.*test.*$/im'],
        [' % test % ', '/^ .* test .* $/im'],
        ['te%st%', '/^te.*st.*$/im'],
    ].forEach((value) => {
        it('converts _like statements as expected: ' + value[0], () => {
            const res = convertQuery(manager, TestModel, {
                testString: { _like: value[0]}
            });
            expect(res.testString.$regex).to.exist;
            expect(res.testString.$regex.toString()).to.equal(value[1]);
        });
    });

});
