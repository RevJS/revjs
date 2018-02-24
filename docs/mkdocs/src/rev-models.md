
# rev-models - RevJS Data Models

The `rev-models` module provides the following:

 * A set of [Built-in Field Types](#built-in-field-types) for defining your
   data models
 * A [ModelManager](#modelmanager-functions) object, which holds the list of
   your registered models, and provides functions for **create**, **read**,
   **update** and **delete**.

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

## ModelManager functions

[rev-models API Documentation](/api/rev-models)

## Contributing

We are actively looking to build a team around RevJS. If you are interesting in
contributing, fork us on github or drop us a
[mail](mailto:russ@russellbriggs.co)!
