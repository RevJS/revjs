# Creating your Data Model

## Defining Models

A "Model" in RevJS is simply a JavaScript Class with some additional properties
that tell RevJS how to validate, store and retrieve data.

If you are using **TypeScript**, then you can use decorators to easily define
the properties of your model.

In order to use your model classes, you must register them using the
[register()](/api/rev-models/classes/modelmanager.html#register) method of a
[ModelManager](/api/rev-models/classes/modelmanager.html) instance.

The example below shows how to create two related models, and register them
with a ModelManager:

```ts
{!examples/src/defining_and_using_models/creating_models.ts!}
```

## Built-in Field Types

RevJS ships with a set 15 standard field types, and you can also create your own
by extending the [Field](/api/rev-models/classes/field.html) class.

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
