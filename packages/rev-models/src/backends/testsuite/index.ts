import { IBackend } from '../backend';
import { createTests } from './create.tests';
import { autoNumberTests } from './autonumber.tests';
import { readTests } from './read.tests';
import { queryTests } from './query.tests';
import { updateTests } from './update.tests';
import { removeTests } from './remove.tests';
import { createWithRelatedModelTests } from './create.related.tests';
import { readWithRelatedModelTests } from './read.related.tests';
import { updateWithRelatedModelTests } from './update.related.tests';

export interface IBackendTestConfig {
    backend: IBackend;
    skipRawValueTests?: boolean;
    skipRelatedModelListStoreTest?: boolean;
}

export function standardBackendTests(backendName: string, config: IBackendTestConfig) {
    readTests(backendName, config);
    queryTests(backendName, config);
    createTests(backendName, config);
    updateTests(backendName, config);
    removeTests(backendName, config);
    autoNumberTests(backendName, config);
    readWithRelatedModelTests(backendName, config);
    createWithRelatedModelTests(backendName, config);
    updateWithRelatedModelTests(backendName, config);
}
