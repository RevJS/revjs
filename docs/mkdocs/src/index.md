# RevJS - Rev up your data-driven JS app development!

## What is RevJS?

RevJS is a suite of JavaScript modules designed to speed up development of
data-driven JS applications.

RevJS allows you to

 * Define a relational **data model** using plain JS classes, and built-in or custom field types
 * Define custom **validation logic** directly in your models
 * Easily create a **GraphQL API** to make your models available over the network
 * Quickly build a **user interface** for the web or mobile, using our React higher-order components

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

### [rev-models](components/rev-models.md)

Define your Data Models and Validation, and easily test them out with the in-memory
storage provided.

### [rev-api](components/rev-api.md)

Expose your data model via an automatically-generated GraphQL API

### [rev-api-client](components/rev-api-client.md)

Access your server-side models in the browser or on a mobile device,
using the same API and validation logic.

### [rev-ui](components/rev-ui.md)

Quickly build user interfaces with data from your RevJS backend using our
React higher-order components.

## Contributing

We are actively looking to build a team around RevJS. If you are interesting in
contributing, fork us on github or drop us a
[mail](mailto:russ@russellbriggs.co)!

## License

MIT
