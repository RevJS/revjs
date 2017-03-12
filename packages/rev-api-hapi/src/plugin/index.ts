
import * as Hapi from 'hapi';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import { ModelApiRegistry, registry as revApiRegistry } from 'rev-api/lib/registry';
import { getVersion } from './utils';

const pluginVersion = getVersion();

export interface IRevApiOptions {
    url?: string;
    registry?: ModelApiRegistry;
    graphiqlEnabled?: boolean;
    graphiqlUrl?: string;
}

export const DEFAULT_REVAPI_OPTIONS: IRevApiOptions = {
    url: '/api',
    registry: revApiRegistry,
    graphiqlEnabled: true,
    graphiqlUrl: '/graphiql'
};

export function RevApiPlugin(server: Hapi.Server, options: IRevApiOptions, next: any) {
    try {
        server.expose('version', pluginVersion);

        let opts: IRevApiOptions = Object.assign({}, DEFAULT_REVAPI_OPTIONS);
        if (options && typeof options == 'object') {
            Object.assign(opts, options);
        }

        if (!opts.url || typeof opts.url != 'string') {
            throw new Error('RevApiPlugin: options.url must be a string');
        }
        if (!opts.registry || !(opts.registry instanceof ModelApiRegistry)) {
            throw new Error('RevApiPlugin: options.registry must be an instance of ModelApiRegistry');
        }

        let schema = opts.registry.getGraphQLSchema();

        let plugins: any = [
            {
                register: graphqlHapi,
                options: {
                    path: opts.url,
                    graphqlOptions: {
                        schema: schema,
                    },
                    route: {
                        cors: true
                    }
                },
            }
        ];
        if (opts.graphiqlEnabled) {
            plugins.push({
                register: graphiqlHapi,
                options: {
                    path: opts.graphiqlUrl,
                    graphiqlOptions: {
                        endpointURL: opts.url
                    },
                },
            });
        }

        server.register(plugins,
        (err) => {
            if (err) {
                next(err);
            }
            else {
                next();
            }
        });
    }
    catch (err) {
        next(err);
    }
}

(RevApiPlugin as any).attributes = {
    name: 'revApi',
    version: pluginVersion
};
