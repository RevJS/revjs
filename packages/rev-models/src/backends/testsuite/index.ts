import { IBackend } from '../backend';
import { createTests } from './create.tests';
import { autoNumberTests } from './autonumber.tests';
import { readTests } from './read.tests';

export function standardBackendTests(backendName: string, backend: IBackend) {
    readTests(backendName, backend);
    createTests(backendName, backend);
    autoNumberTests(backendName, backend);
}
