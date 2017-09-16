# RevJS - Rev up your data-driven JS app development!

RevJS is a rapid application development toolkit designed to simplify creation
of data-driven JS apps.

The `rev-models` module is the core component of RevJS, which includes a model metadata
registry, field types, CRUD functions and simple in-memory data storage to help new
users get up and running quickly.

This project is currently in pre-alpha stages, but is getting closer to alpha!

The basic idea is, this code:

```typescript
import * as rev from 'rev-models';

class Person {
    @rev.IntegerField()
        id: number;    
    @rev.TextField({label: 'Name'})
        name: string;
    @rev.EmailField({label: 'Email', required: false})
        email: string;
}

rev.register(Person)

let bob = new Person()
person.name = 'Bob';
person.email = 'bob@bob.com';

rev.create(bob);

```

...plus a small amount of configuration, gives you:

 * Create, Read, Update, Delete access to Person records from a database

 * A full GraphQL API (with a swagger specification)

 * Fully-customiseable, automatically generated forms for a variety of UI frameworks

 * Data-validation and other model methods shared between client and server (write once, validate everywhere :) )
