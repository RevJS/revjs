
import * as Hapi from 'hapi';
import * as rev from 'rev-models';
import { ModelManager, InMemoryBackend } from 'rev-models';
import { ModelApiManager } from 'rev-api';

export interface IServerOptions {
    addPlugins?: any;
}

export function createServer(options: IServerOptions): Promise<Hapi.Server> {
    return new Promise((resolve, reject) => {
        let server = new Hapi.Server();
        server.connection({});
        if (options.addPlugins) {
            server.register(options.addPlugins, {} as any, (err: Error) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(server);
                }
            });
        }
        else {
            resolve(server);
        }
    });
}

export function createApiRegistry() {

    class TestModel {
        @rev.IntegerField()
            id: number = 1;
        @rev.TextField()
            name: string = 'A Test Model';
        @rev.DateField()
            date: Date = new Date();
    }

    let modelRegistry = new ModelManager();
    modelRegistry.registerBackend('default', new InMemoryBackend());
    modelRegistry.register(TestModel);

    let apiRegistry = new ModelApiManager(modelRegistry);
    apiRegistry.register({ model: TestModel, operations: ['create', 'update', 'remove', 'read'] });
    return apiRegistry;
}
