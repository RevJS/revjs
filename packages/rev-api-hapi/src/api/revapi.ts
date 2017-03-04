
import * as Hapi from 'hapi';
import { ModelApiRegistry, registry as revApiRegistry } from 'rev-api/lib/registry';

export interface IRevApiOptions {
    baseUrl?: string;
    apiRegistry?: ModelApiRegistry;
}

export const URL_MATCH_PATTERN = '{model}/{method?}';

export class RevApi {
    baseUrl: string;
    apiRegistry: ModelApiRegistry;

    constructor(server: Hapi.Server, options?: IRevApiOptions) {

        this.baseUrl = '/api/';
        this.apiRegistry = revApiRegistry;
        if (options) {
            if (options.baseUrl && typeof options.baseUrl == 'string') {
                let u = options.baseUrl;
                if (u[u.length - 1] != '/') {
                    u += '/';
                }
                this.baseUrl = u;
            }
            if (options.apiRegistry
                    && typeof options.apiRegistry == 'object'
                    && options.apiRegistry instanceof ModelApiRegistry) {
                this.apiRegistry = options.apiRegistry;
            }
        }

        server.route({
            method: ['GET', 'POST', 'PUT', 'DELETE'],
            path: this.baseUrl + URL_MATCH_PATTERN,
            handler: this.__handleRequest
        });
    }

    __handleRequest(request: Hapi.Request, reply: Hapi.IReply) {
        reply('Hello World! ' + JSON.stringify(request.params));
    }

}
