
## RevJS Module Releases

### Upcoming Changes

**`rev-api`**

* Improve error when a GraphQL fieldMapping is not found for a field type
* Fix GraphQL mappings for EmailField, URLField and PasswordField

**`rev-api-client`**

* Fix error when model fields are null

**`rev-ui`**

* Added viewContext.remove() method.
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