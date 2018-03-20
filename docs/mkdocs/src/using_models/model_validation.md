# Defining Data Validation

One of the major benefits of using JavaScript on both the Client and Server is
the ability to share business logic and validations across both platforms.

RevJS provides two main methods of validating your data.

1. Field-level validation, using the built-in field types or your own custom
   field types.
2. Model-level validation, by defining a `validate()` or `validateAsync()`
   method on your model.

## Using Field-level validation

The build-in field types have a number of configurable validation options,
which can be set directly on your models. For example:

```ts
class MyClass {
    @TextField({ maxLength: 100, regEx: /abc/ })
        name: string;
}
```

For more information on the options available for each field type, check out
the [IFieldOptions interface](/api/rev-models/interfaces/ifieldoptions.html)
and its sub-classes.

## Using Model-level validation

You can implement more complex validation logic in a
[validate()](/api/rev-models/interfaces/imodel.html#validate) or
[validateAsync()](/api/rev-models/interfaces/imodel.html#validateasync) method
directly in your model.

RevJS will call these methods for every `create` or `update` operation. You
simply check the property values of `this.` to determine if the model is valid.

RevJS passes in a single
[IValidationContext](/api/rev-models/interfaces/ivalidationcontext.html)
parameter to the validation functions, which you can use to find out more about
the validation context. For example you can check `ctx.operation.operationName`
to determine if this is a `create` or `update`.

If there is a validation error, you can record a field-level error by calling
[ctx.result.addFieldError()](/api/rev-models/classes/modelvalidationresult.html#addfielderror),
or you can record a model-level error by calling
[ctx.result.addModelError()](/api/rev-models/classes/modelvalidationresult.html#addmodelerror),

The example below demonstrates how to use both field-level and model-level validation.

```ts
{!examples/src/defining_and_using_models/custom_validation.ts!}
```

The output of the above code is:

```
ValidationError
 * title: Cannot create post with a duplicate title!
```
