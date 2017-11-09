
import * as Hapi from 'hapi';
import * as rev from 'rev-models';
import { ModelApiManager, ApiOperations, ApiMethod } from 'rev-api';

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

    @ApiOperations(['create', 'update', 'remove', 'read'])
    class TestModel {
        @rev.IntegerField()
            id: number = 1;
        @rev.TextField()
            name: string = 'A Test Model';
        @rev.DateField()
            date: Date = new Date();

        @ApiMethod()
        testMethod() {}
    }

    let modelRegistry = new rev.ModelManager();
    modelRegistry.registerBackend('default', new rev.InMemoryBackend());
    modelRegistry.register(TestModel);

    let apiRegistry = new ModelApiManager(modelRegistry);
    apiRegistry.register(TestModel);
    return apiRegistry;
}
