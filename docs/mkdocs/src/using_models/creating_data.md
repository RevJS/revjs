# Creating Model Data

Since RevJS models are just JavaScript classes, you create new records by
creating new instances of your model class, and passing them to the
[ModelManager.create()](/api/rev-models/classes/modelmanager.html#create)
method.

## Defining Model Constructors

To make it easier to populate new records, we recommend adding a constructor
function to your class, as shown in the example below:

```ts
class MyCoolModel {
    @TextField()
        title: string;
    @TextField({ multiLine: true })
        body: string;

    constructor(data?: Partial<MyCoolModel>) {
        Object.assign(this, data);
    }
}
```

Doing this means you can then construct new records with new data in a single
statement, as shown below:

```ts
const new_record = new MyCoolModel({
    title: 'New Record',
    body: 'This is a cool new record with some data!'
});
```

**IMPORTANT NOTE:** It should also be possible to construct instances
of your model **without** passing any data. RevJS needs to do this when
hydrating models from data retrieved from a backend.

## Storing Model Data

To store data for your model in a backend, simply pass a populated instance
of your model to the
[ModelManager.create()](/api/rev-models/classes/modelmanager.html#create)
method.

The model data will be validated before it is passed to the backend. If any
validation errors occur, a
[ValidationError](/api/rev-models/classes/validationerror.html) will be
thrown.

The example below shows how to define a model and create some data for it:

```ts
{!examples/src/defining_and_using_models/creating_and_reading_a_model.ts!}
```
