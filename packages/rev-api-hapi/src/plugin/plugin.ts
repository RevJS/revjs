
import * as Hapi from 'hapi';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import { ModelApiRegistry } from 'rev-api';
import { getVersion } from './utils';

const pluginVersion = getVersion();

export interface IModelApiPluginOptions {
    registry: ModelApiRegistry;
    url?: string;
    graphiqlEnabled?: boolean;
    graphiqlUrl?: string;
}

export const DEFAULT_API_OPTIONS: Partial<IModelApiPluginOptions> = {
    url: '/api',
    graphiqlEnabled: true,
    graphiqlUrl: '/graphiql'
};

export function ModelApiPlugin(server: Hapi.Server, options: IModelApiPluginOptions, next: any) {
    try {
        server.expose('version', pluginVersion);

        let opts: IModelApiPluginOptions = Object.assign({}, DEFAULT_API_OPTIONS);
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

(ModelApiPlugin as any).attributes = {
    name: 'revApi',
    version: pluginVersion
};
