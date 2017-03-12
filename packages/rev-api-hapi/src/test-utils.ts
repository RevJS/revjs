
import * as Hapi from 'hapi';
import * as rev from 'rev-models';
import { ModelRegistry } from 'rev-models/lib/registry';
import { ModelApiRegistry } from 'rev-api/lib/registry';

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
        @rev.IntegerField('Id')
            id: number = 1;
        @rev.TextField('Name')
            name: string = 'A Test Model';
        @rev.DateField('Date')
            date: Date = new Date();
    }

    let modelRegistry = new ModelRegistry();
    modelRegistry.register(TestModel);

    let apiRegistry = new ModelApiRegistry(modelRegistry);
    apiRegistry.register(TestModel, { methods: 'all' });
    return apiRegistry;
}
