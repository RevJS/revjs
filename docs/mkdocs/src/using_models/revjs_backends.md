# RevJS Backends

RevJS has a **pluggable backend architecture**, to allow you to store your
models in a variety of databases, and send them across the network using APIs.

## Using a Backend

You specify a backend when you create an instance of a
[ModelManager](/api/rev-models/classes/modelmanager.html), for example:

```ts
const manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
```

If you have data in multiple databases or APIs, you can register
more than one backend for a model manager.

When registering your models, you can tell the ModelManager which backend to
source them from. For example:

```ts
manager.register(TestModel, { backend: 'customer_db' });
```

If you do not specify a backend when registering your model, then the
`default` backend is used.

## Persistant Storage Backends

 * **[MongoDBBackend](/api/rev-backend-mongodb/classes/mongodbbackend.html)** -
   stores and retrieves your data from MongoDB

## API Backends

 * **[ModelApiBackend](/api/rev-api-client/classes/modelapibackend.html)** -
   store and retrieve data from a GraphQL API created by the `rev-api` module

## Ephemeral Backends

 * **[InMemoryBackend](/api/rev-models/classes/inmemorybackend.html)** - stores your
   model data temporarily in-memory. Ideal for initial development and automated
   testing.

## Contributing

We have defined a standard [IBackend](/api/rev-models/interfaces/ibackend.html)
interface, as well as a
[Standard Test Suite](https://github.com/RevJS/revjs/blob/master/packages/rev-models/src/backends/testsuite/index.ts)
to help with new backend development. We're keen to accept any contributions
from the community!