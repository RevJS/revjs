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

## Searching for Data

RevJS uses a MongoDB-like query language for building search queries. Below are
some examples:

```ts
{!examples/src/searching_and_reading_data/read_with_where_clause.ts!}
```

## RevJS Query Operators

### Logical Operators

These operators take an array of conditions (as per the `_or` example above).

* `_and` - all conditions in the array must be true
* `_or` - at least one of the conditions in the array must be true

### Value Operators

These operators take a single value (as per the `_gte` example above).

* `_eq` - equals - field must exactly match the specified value
* `_neq` - not equals - field must not match the specified value
* `_gt` - greater than - field must be greater than the specified value
* `_gte` - greater than or equal to - field must be greater than or equal to the specified value
* `_lt` - less than - field must be less than the specified value
* `_lte` - less than or equal to - field must be less than or equal to the specified value
* `_like` - like - field must be like the specified value, which can include `%` symbols to match multiple characters (works as per the traditional SQL 'LIKE' clause)

### Value List Operators

These operators take an array of values.

* `_in` - in - field must match one of the values in the array
* `_nin` - not in - field must not match any of the values in the array

## Using `limit` and `offset`

You can use the `limit` and `offset` options with the
[read()](/api/rev-models/classes/modelmanager.html#read) method, to
*page* through query results, as shown in the examples below:

```ts
{!examples/src/searching_and_reading_data/read_with_paging.ts!}
```

## Sorting Data

You can use the **orderBy** option to specify the order of the records that are
retrieved from the backend. This option takes an array of field names, and the
records are sorted by each of the specified fields, in order. You can optionally
use the `desc` keyword after the field name, to sort the values in that field
in descending order.

```ts
{!examples/src/searching_and_reading_data/read_with_sorting.ts!}
```
