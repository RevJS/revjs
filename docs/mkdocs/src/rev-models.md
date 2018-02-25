
# rev-models - RevJS Data Models

The `rev-models` module provides the following:

 * A set of [Built-in Field Types](#built-in-field-types) for defining your
   data models
 * A [ModelManager](#modelmanager-functions) object, which holds the list of
   your registered models, and provides functions for **create**, **read**,
   **update** and **delete**.
 * An **in-memory** storage backend, so you can play with RevJS functions without
   needing to set up a database.

*Jump to the [rev-models API Documentation](/api/rev-models)*

## Example

The example below registers a simple data class with some basic validation
rules, creates some data, and reads it back.

```ts
{!examples/src/defining_and_using_models/creating_and_reading_a_model.ts!}
```

## Built-in Field Types

 * **[TextField](/api/rev-models/classes/textfield.html)** - Single, or multi-line text field
 * **[EmailField](/api/rev-models/classes/emailfield.html)** - TextField with e-mail address validation
 * **[UrlField](/api/rev-models/classes/urlfield.html)** - TextField with URL validation
 * **[PasswordField](/api/rev-models/classes/passwordfield.html)** - Password field
 * **[NumberField](/api/rev-models/classes/numberfield.html)** - Number entry field (any numeric value)
 * **[IntegerField](/api/rev-models/classes/integerfield.html)** - Integer entry field
 * **[AutoNumberField](/api/rev-models/classes/autonumberfield.html)** - Auto-generated, sequential integer field
 * **[BooleanField](/api/rev-models/classes/booleanfield.html)** - True / false
 * **[SelectField](/api/rev-models/classes/selectfield.html)** - Single-item selection field
 * **[MultiSelectField](/api/rev-models/classes/multiselectfield.html)** - Multiple-item selection field
 * **[DateField](/api/rev-models/classes/datefield.html)** - Date-only field
 * **[TimeField](/api/rev-models/classes/timefield.html)** - Time-only field
 * **[DateTimeField](/api/rev-models/classes/datetimefield.html)** - Date & Time field
 * **[RelatedModelField](/api/rev-models/classes/relatedmodelfield.html)** - Foreign-key link to a related model
 * **[RelatedModelListField](/api/rev-models/classes/relatedmodellistfield.html)** - List of related models

## Custom Validation

In addition to the built-in, configurable validation provided by the
standard field types, you can specify your own validation rules directly on your
models, as shown in the example below

```ts
{!examples/src/defining_and_using_models/custom_validation.ts!}
```

The output of the above code is:

```
ValidationError
 * title: Cannot create post with a duplicate title!
```

For further information on model validation functions, check out the
[IModel](/api/rev-models/interfaces/imodel.html) interface

## ModelManager functions

The RevJS [ModelManager](/api/rev-models/classes/modelmanager.html) has the
following main functions:

 * [registerBackend()](/api/rev-models/classes/modelmanager.html#registerbackend) -
   used to configure the database or API where your models are stored
 * [read()](/api/rev-models/classes/modelmanager.html#read) - read models from
   your backend
 * [create()](/api/rev-models/classes/modelmanager.html#create) - store a new
   model in your backend
 * [update()](/api/rev-models/classes/modelmanager.html#update) - update a model
   already stored in the backend
 * [remove()](/api/rev-models/classes/modelmanager.html#remove) - remove a model
   that is currently stored in the backend

## Supported Backends

The following back-ends are currently supported:

 * [InMemoryBackend](/api/rev-models/classes/inmemorybackend.html) - stores your
   model data in-memory. Ideal for initial development and automated testing.
 * **ModelApiBackend** - designed for use in the browser or mobile app.
   Uses the API created by `rev-api` to store and retrieve your models.
 * **MongoDBBackend** - stores and retrieves your data from MongoDB

We have defined a standard [IBackend](/api/rev-models/interfaces/ibackend.html)
interface, as well as a
[Standard Test Suite](https://github.com/RevJS/revjs/blob/master/packages/rev-models/src/backends/testsuite/index.ts)
to aid with new backend development, and are keen to accept any contributions
from the community!

## Contributing

We are actively looking to build a team around RevJS. If you are interesting in
contributing, fork us on github or drop us a
[mail](mailto:russ@russellbriggs.co)!
