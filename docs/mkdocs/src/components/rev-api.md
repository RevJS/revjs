
# rev-api - RevJS GraphQL API Generator

The `rev-api` module provides the following:

 * A **ModelApiManager** object, for registering your models to be exposed via
   the GraphQL API
 * An **@ApiOperations** decorator, for annotating your models with the operations
   that are allowed on them (`read`, `create`, etc.)
 * An **@ApiMethod** decorator, for annotating any model methods that you
   want to expose as GraphQL mutations.

For more information, check out [Creating an API](../creating_an_api/overview.md)

*Jump to the [rev-api API Documentation](/api/rev-api)*

## Example

The example below creates a few models and assigns them to a ModelApiManager.

```ts
{!examples/src/creating_an_api/defining_an_api.ts!}
```

## Contributing

We are actively looking to build a team around RevJS. If you are interesting in
contributing, fork us on github or drop us a
[mail](mailto:russ@russellbriggs.co)!
