
import * as Hapi from 'hapi';
import { ModelApiRegistry, registry as revApiRegistry } from 'rev-api/registry';

export interface IRevApiOptions {
    baseUrl?: string;
    apiRegistry?: ModelApiRegistry;
}

export class RevApi {
    baseUrl: string;
    apiRegistry: ModelApiRegistry;

    constructor(server: Hapi.Server, options?: IRevApiOptions) {

        this.baseUrl = '/api';
        this.apiRegistry = revApiRegistry;
        if (options) {
            if (options.baseUrl && typeof options.baseUrl == 'string') {
                this.baseUrl = options.baseUrl;
            }
            if (options.apiRegistry
                    && typeof options.apiRegistry == 'object'
                    && options.apiRegistry instanceof ModelApiRegistry) {
                this.apiRegistry = options.apiRegistry;
            }
        }

        server.route({
            method: ['GET', 'POST', 'PUT', 'DELETE'],
            path: this.baseUrl,
            handler: this.__handleRequest
        });
    }

    __handleRequest(req: Hapi.Request, reply: Hapi.IReply) {
        reply('Hello World!');
    }

}
