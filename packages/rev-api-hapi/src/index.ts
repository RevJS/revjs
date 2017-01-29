
import * as Hapi from 'hapi';
import { ModelApiRegistry } from 'rev-api/registry';

export interface IRevApiPluginOptions {
    baseUrl?: string;
    apiRegistry: ModelApiRegistry;
}

let version = require('../package.json').version;

function RevApiPlugin(server: Hapi.Server, options: IRevApiPluginOptions, next: any) {
    server.expose('version', version);
    next();
}

(RevApiPlugin as any).attributes = {
    name: 'rev-api',
    version: version
};

export default RevApiPlugin;
