# RevJS - Rev up your data-driven JS app development!

[![Join the chat at https://gitter.im/RevJS/revjs](https://badges.gitter.im/RevJS/revjs.svg)](https://gitter.im/RevJS/revjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

RevJS is a suite of JavaScript modules designed to speed up development of
data-driven JS applications.

RevJS allows you to

 * Define a relational **data model** using plain JS classes, and built-in or custom field types
 * Define custom **validation logic** directly in your models
 * Easily create a **GraphQL API** to make your models available over the network
 * Quickly build a **user interface** for the web or mobile, using our React higher-order components

This project will shortly be in BETA. Watch this space!! :)
You can see what we're currently working in our
[Github Projects](https://github.com/RevJS/revjs/projects)

The basic idea is, this code:

```typescript
import { AutoNumberField, TextField, SelectField } from 'rev-models';

const POST_STATUS = [
    ['draft', 'Draft'],
    ['published', 'Published']
];

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @TextField({ minLength: 5, maxLength: 100 })
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @SelectField({ selection: POST_STATUS })
        status: string;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

```

...plus a small amount of configuration, gives you:

 * Create, Read, Update, Delete access to Post records from a database

 * A full GraphQL API for front-end integration

 * Higher-order React UI components to make it easy to create front-ends for your data

 * Data-validation and other model methods shared between client and server (write once, validate everywhere :) )

Check out the documentation on [revjs.org](https://revjs.org/)