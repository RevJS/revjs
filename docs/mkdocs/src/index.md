# RevJS - Rev up your data-driven JS app development!

## What is RevJS?

RevJS is a suite of JavaScript modules designed to speed up development of
data-driven JS applications.

RevJS allows you to

 * Define your data model using **plain JS Classes**, and built-in or custom field types
 * Define custom synchronous or asynchronous **validation logic** directly on your models
 * Make your models available over the network via an **automatically generated GraphQL API**
 * Quickly build your **data-driven user interface in React**, using our Higher Order Components

## Example

The below example shows how to create a simple data model with RevJS's `rev-models` module:

```ts
{!examples/src/defining_and_using_models/creating_models.ts!}
```

ResJS is designed for use with **TypeScript**, to give you all the
benefits of strong typing and intellisense, however it should work with
standard ES6+ too. (we're looking for someone interested in creating and
maintaining a revjs ES6+ guide!...)

## Components

See the sections linked below for further information on each module of RevJS

### [rev-models](rev-models.md)

Define your Data Models and Validation, and easily test them out with the in-memory
storage provided.

### [rev-api](rev-api.md)

Expose your data model via an automatically-generated GraphQL API

### [rev-api-client](rev-api-client.md)

Access your server-side models in the browser or on a mobile device,
using the same API and validation logic.

### [rev-ui](rev-ui.md)

Quickly build user interfaces with data from your RevJS backend using our
React higher-order components.

## Contributing

We are actively looking to build a team around RevJS. If you are interesting in
contributing, fork us on github or drop us a
[mail](mailto:russ@russellbriggs.co)!

## License

MIT
