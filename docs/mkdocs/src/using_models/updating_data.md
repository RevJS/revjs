# Updating Model Data

You can update records using the
[ModelManager.update()](/api/rev-models/classes/modelmanager.html#update)
method. There are a couple of ways to use it:

## Updating Data from Reads

If you have retrieved some data via a
[read()](/api/rev-models/classes/modelmanager.html#read) operation, then you
can update the retrieved records directly, as shown in the example below:

```ts
{!examples/src/defining_and_using_models/updating_data.ts!}
```

**NOTE:** In order to update records without specifying a *where* clause, your
model must have a field with `primaryKey: true` set.

## Updating Data with a Where clause

If you wish to modify one or more fields across *multiple records*, you can
use the **where** clause, as shown in the example below:

```ts
{!examples/src/defining_and_using_models/updating_multiple_records.ts!}
```
