# DEPRECATION NOTICE

I've made the decision to deprecate this project. Implementing and maintaining a custom
ORM is a very complex job and there are far more mature solutions already available on
other platforms.

HOWEVER the concept of this project lives on. I am still passionate about building a
platform that makes it super-easy to create business apps in record time, and I am now
focussing my efforts on a Kotlin-based CRM platform using the Hibernate ORM, GraphQL
and many of the UI elements developed for RevJS. Check it out!...
[RevCRM.com](http://revcrm.com)

# RevJS - Rev up your data-driven JS app development!

RevJS is a suite of JavaScript modules designed to speed up development of
data-driven JS applications.

The `rev-backend-mongodb` module provides a backend which retrieves and
saves data to a MongoDB database.

RevJS allows you to

 * Define a relational **data model** using plain JS classes, and built-in or custom field types
 * Define custom **validation logic** directly in your models
 * Easily create a **GraphQL API** to make your models available over the network
 * Quickly build a **user interface** for the web or mobile, using our React higher-order components

## Getting Started

 * Check out the [Client-side Demo App](https://revjs.org/tasks_demo/) and its
   [source code](https://github.com/RevJS/tasks_demo)

 * Take a look at the [Documentation](https://revjs.org/):

   * [Creating Models](http://revjs.org/using_models/creating_models/)
   * [Defining a GraphQL API](http://revjs.org/creating_an_api/overview/)
   * [Building a UI](http://revjs.org/creating_a_ui/overview/)

## Development Status

We're on our way to v1.0.0, and are keen to get more users and contributors
on board. You can see what we're currently working in our
[Github Projects](https://github.com/RevJS/revjs/projects).

## Examples

Theres a full set of working examples
[in the repo](https://github.com/RevJS/revjs/tree/master/packages/examples/src)
but heres a few snippets of code to give you an idea of what RevJS is all about!:

### Defining and Using Models

```ts
// Define a new Post model
const POST_CATEGORIES = [
    ['agriculture', 'Agriculture'],
    ['music', 'Music'],
    ['science', 'Science'],
    ['technology', 'Technology'],
];

export class Post {
    @AutoNumberField({ primaryKey: true })
        id: number;
    @SelectField({ selection: POST_CATEGORIES })
        category: string;
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;
    @IntegerField({ required: false })
        rating: number;
    @BooleanField()
        published: boolean;

    constructor(data?: Partial<Post>) {
        Object.assign(this, data);
    }
}

// Add the Post model to a ModelManager
export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(Post);

// Create some data
await modelManager.create(new Post({
    category: 'agriculture',
    title: 'My First Post',
    body: 'This is a really cool post made in RevJS!',
    rating: 5,
    published: true
}));
```

### Creating a GraphQL API

```ts
export const api = new ModelApiManager(modelManager);

api.register(Post, { operations: ['read', 'create', 'update', 'remove']});

const schema = api.getGraphQLSchema();

router.post('/graphql', graphqlKoa({ schema: schema }));
```

### Building a User Interface

```tsx
<ModelProvider modelManager={modelManager} >
    <ListView
        title="Popular Posts"
        model="Post"
        fields={[
            'title',
            'category',
            'rating',
        ]}
        where={{
            rating: { _gt: 3 }
        }}
        orderBy={['rating desc']}
        limit={10}
    />
</ModelProvider>
```

```tsx
<ModelProvider modelManager={modelManager} >

    <Typography variant="display1">Create Post</Typography>

    <DetailView model="Post">
        <Field name="title" />
        <Field name="category" />
        <Field name="body" colspan={12} />
        <Field name="rating" />
        <Field name="published" />

        <SaveAction label="Create Post" />
    </DetailView>

</ModelProvider>
```

## Screenshots

![Screenshot 0](docs/screenshot0.png)

![Screenshot 1](docs/screenshot1.png)

![Screenshot 2](docs/screenshot2.png)

![Screenshot 3](docs/screenshot3.png)

## Licence

MIT