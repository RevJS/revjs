# RevJS - Rev up your data-driven JS app development!

RevJS is a rapid application development toolkit designed to simplify creation
of data-driven JS apps.

The `rev-models` module is the core component of RevJS, which includes a model metadata
registry, field types, CRUD functions and simple in-memory data storage to help new
users get up and running quickly.

This project is currently in pre-alpha stages, but is getting closer to alpha!

The basic idea is, this code:

```typescript
class Person {
    @IntegerField('Id')    id: number;
    @TextField('Name')     name: string;
    @EmailField('Email')   email: string;
}

rev.register(Person)
```

...plus a small amount of configuration, gives you:

 * Create, Read, Update, Delete access to Person records from a database

 * A full HTTP REST API (with a swagger specification)

 * Fully-customiseable, automatically generated forms for a variety of UI frameworks

 * Data-validation and other model methods shared between client and server (write once, validate everywhere :) )
