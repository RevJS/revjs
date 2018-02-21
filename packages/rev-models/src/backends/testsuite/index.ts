import { IBackend } from '../backend';
import { createTests } from './create.tests';
import { autoNumberTests } from './autonumber.tests';

export function standardBackendTests(backendName: string, backend: IBackend) {
    createTests(backendName, backend);
    autoNumberTests(backendName, backend);
}
