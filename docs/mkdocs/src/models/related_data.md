# Working with Related Models

To fully model your data, you will normally want to define relationships
between your models.

For example, you might want to associate a **Post** model with a **User** (the
author), and also your **Post** model may have many **Comments** linked with it.

## Defining Relationships

RevJS currently has two types of relational fields:

* A [RelatedModel](/api/rev-models/classes/relatedmodelfield.html) field is a
  link from the current model to **one record from another model**. In the
  **Post** example above, you would add a `@RelatedModel()` field for the
  `user` field.
* A [RelatedModelList](/api/rev-models/classes/relatedmodellistfield.html)
  field allows access to **a list of records from another model**, that are
  linked to the current one via a RelatedModel field. In the **Post** example
  above, you would add a `@RelatedModelList()` field for the `comments` field.

Lets implement the **Post**, **User**, **Comments** example to show how these
fields work:

 * A **User** can have a **list of Posts** and a **list of Comments**
 * A **Post** is linked to a single **User**. and can have a **list of Comments**
 * A **Comment** is linked to a single **User** and a single **Post**

```ts
{!examples/src/using_related_models/creating_related_models.ts!}
```

## Creating Related Model Data

As with most RevJS operations, you can create relationships between models
simply by assigning values to JavaScript objects as you normally would, then
passing the resulting object to the
[create()](/api/rev-models/classes/modelmanager.html#create) or
[update()](/api/rev-models/classes/modelmanager.html#update) methods of
your [ModelManager](/api/rev-models/classes/modelmanager.html).

The below example shows how to create a set of related Users, Posts and
Comments:

```ts
{!examples/src/using_related_models/creating_related_data.ts!}
```

**NOTE:** - RevJS supports assigning values to **RelatedModel** fields only at
the moment. Changes to RelatedModelList fields do not get stored
currently.

## Reading Related Model Data

By default, RevJS will NOT return related model information for performance
reasons. It is easy to request this data though, using the `related` option
for the
[ModelManager.read()](/api/rev-models/classes/modelmanager.html#read) method.
