
import * as Hapi from 'hapi';
import { IRevApiOptions, RevApi } from './api/revapi';

let version: string = null;

try {
    version = require('./package.json').version;
}
catch (e) {
    version = require('../package.json').version;
}

export function RevApiPlugin(server: Hapi.Server, options: IRevApiOptions, next: any) {
    server.expose('version', version);
    server.expose('api', new RevApi(server, options));
    next();
}

(RevApiPlugin as any).attributes = {
    name: 'revApi',
    version: version
};
