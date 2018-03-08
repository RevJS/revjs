
import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa';

// Load RevJS API and generate GrapQL Schema

import { api } from './defining_an_api';
import { createData } from './model_data';

const schema = api.getGraphQLSchema();

// Create Koa & Apollo GraphQL Server

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

console.log(`GraphQL Server is running on port ${port}.`);
console.log(`GraphiQL UI is running at http://localhost:${port}/graphiql`);

// Load sample data

createData()
.then(() => {
    console.log('Data Loaded.');
})
.catch((e) => {
    console.error('Error loading data', e);
});