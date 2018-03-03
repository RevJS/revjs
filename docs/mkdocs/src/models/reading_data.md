# Reading Model Data

Once you have defined your models and created some data, you can read it back
using the
[ModelManager.read()](/api/rev-models/classes/modelmanager.html#read) method.


## Reading All Data

To read all model data without applying any filters, simply pass the model
class to your ModelManager's **read()** function:

```ts
{!examples/src/searching_and_reading_data/read_with_no_filter.ts!}
```

**IMPORTANT NOTE:** To encourage use of paging, the **read()** function will
only return **the first 20 records** by default. See below for how to use the
`limit` and `offset` options to *page* through the data.

## Filtering the Data

RevJS uses a MongoDB-like query language for building search queries. Below are
some examples:

```ts
{!examples/src/searching_and_reading_data/read_with_where_clause.ts!}
```

## Using `limit` and `offset`