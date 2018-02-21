import { IBackend } from '../backend';
import { createTests } from './create.tests';
import { autoNumberTests } from './autonumber.tests';
import { readTests } from './read.tests';
import { updateTests } from './update.tests';
import { removeTests } from './remove.tests';
import { createWithRelatedModelTests } from './create.related.tests';
import { readWithRelatedModelTests } from './read.related.tests';
import { updateWithRelatedModelTests } from './update.related.tests';

export function standardBackendTests(backendName: string, backend: IBackend) {
    readTests(backendName, backend);
    createTests(backendName, backend);
    updateTests(backendName, backend);
    removeTests(backendName, backend);
    autoNumberTests(backendName, backend);
    readWithRelatedModelTests(backendName, backend);
    createWithRelatedModelTests(backendName, backend);
    updateWithRelatedModelTests(backendName, backend);
}
