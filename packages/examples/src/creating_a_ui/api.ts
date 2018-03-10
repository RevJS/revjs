
import * as models from './models';
import { createData } from './model_data';
import { ModelManager, InMemoryBackend } from 'rev-models';
import { ModelApiManager } from 'rev-api';

// Register server models

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(models.User);
modelManager.register(models.Post);
modelManager.register(models.Comment);

export const api = new ModelApiManager(modelManager);
api.register(models.User);
api.register(models.Post);
api.register(models.Comment);

// Create Koa & Apollo GraphQL Server

import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa';

const schema = api.getGraphQLSchema();

const app = new koa();
const port = 3000;

const router = new koaRouter();
router.post('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);

console.log(`GraphQL Server for UI Demos is running on port ${port}.`);
console.log(`GraphiQL UI is running at http://localhost:${port}/graphiql`);

// Load demo data

createData(modelManager)
.then(() => {
    console.log('Data Loaded.');
})
.catch((e) => {
    console.error('Error loading data', e);
});
