
import { ModelApiBackend } from '../backend';
import { ModelManager } from 'rev-models';
import { getMockApiHttpClient } from './mockHttpClient';

/**
 * Returns a Proxy object for the ModelApiBackend, which intercepts CRUD calls
 * and injects a mock HTTP client that makes calls against an API containing
 * all the models in the passed ModelManager.
 *
 * @param backend
 */
export function backendWithMockApi(backend: ModelApiBackend) {
    return new Proxy(backend, {
        get(target, prop) {
            const originalProp = target[prop];
            if (['create', 'update', 'remove', 'read'].includes(prop.toString())) {
                return (...args: any[]) => {
                    const manager: ModelManager = args[0];
                    const mockHttpClient = getMockApiHttpClient(manager);
                    target._httpClient = mockHttpClient;
                    return originalProp.apply(target, args);
                };
            }
            else {
                return originalProp;
            }
        }
    });
}