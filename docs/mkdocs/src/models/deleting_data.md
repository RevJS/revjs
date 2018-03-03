# Deleting Model Data

You can delete records using the
[ModelManager.remove()](/api/rev-models/classes/modelmanager.html#remove)
method ('delete' is a reserved word in JavaScript). There are a couple of ways to use the remove() method:

## Deleting Data from Reads

If you have retrieved some data via a
[read()](/api/rev-models/classes/modelmanager.html#read) operation, then you
can remove the retrieved records directly, as shown in the example below:

```ts
{!examples/src/defining_and_using_models/removing_data.ts!}
```

**NOTE:** In order to remove records without specifying a *where* clause, your
model must have a field with `primaryKey: true` set.

## Deleting Data with a Where clause

If you wish to delete multiple records, you can
use the **where** clause, as shown in the example below:

```ts
{!examples/src/defining_and_using_models/removing_multiple_records.ts!}
```
