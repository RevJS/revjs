
## RevJS Module Releases

### Next Release

**`rev-models`**

* Added support for fields with property getters. By default, RevJS fields
  with a getter function are set to not be stored (`Field.options.stored == false`)

**`rev-api` & `rev-api-client`**

* API now passes all RevJS standard backend tests (including related model queries)

**`rev-ui`**

* `<ListView />` Renamed `rowLimit` property to `limit` (to match IReadOptions)
* `<ListView />` Added `where` property for setting list filter
* `<ListView />` Added `related` property to included related model data
* `<ListView />` Added `orderBy` property for sorting results
* `<ListView />` supports RelatedModelFields (will use toString() on the class)

### 0.12.0

**`rev-api`**

* Improve error when a GraphQL fieldMapping is not found for a field type
* Fix GraphQL mappings for EmailField, URLField and PasswordField

**`rev-api-client`**

* Fix error when model fields are null

**`rev-ui`**

* Added viewContext.remove() method. We now have full CRUD :)
* Added `<RemoveAction />` component for removing the current record in a `<DetailView />`
* All Action components now have default labels

### 0.11.0 - 8th March 2018

* First public release of `rev-backend-mongodb`. Passes full backend test suite
* Docs and guides updated

### 0.10.0 - 3rd March 2018

* Remove unnecessary `IModelValidationResult.validationFinished` property
* Docs updates

### 0.9.1 - 3rd March 2018

* Docs update
* Mark some module internals as @private