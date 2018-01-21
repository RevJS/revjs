# RevJS - Rev up your data-driven JS app development!

RevJS is a rapid application development toolkit designed to simplify creation
of data-driven JS apps.

The `rev-models` module is the core component of RevJS, which includes a model metadata
registry, field types, CRUD functions and simple in-memory data storage to help new
users get up and running quickly.

**PLEASE NOTE: This project is currently in alpha**

Breaking API changes are possible while we refine the way the modules interoperate.
Once we reach version 1.0.0 then we will be following strict semantic versioning.

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

 * A full GraphQL API

 * Fully-customiseable UI components for Web & Mobile

 * Data-validation and other model methods shared between client and server (write once, validate everywhere :) )
