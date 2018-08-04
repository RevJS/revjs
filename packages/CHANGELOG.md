
## RevJS Module Releases

### 0.22.0 - TBC

* Update to TypeScript 3.0
* Update devDependencies


### 0.21.0 - 21st June 2018

**`rev-models`**

* `_eq` operator now searches MultiSelectField options for a match

**`rev-ui-materialui`**

* Added `<MUIMultiSelectField />` component and associated search field

### 0.20.0 - 19th June 2018

**`rev-ui`**

* `<DetailView />` has a new `related` prop for loading `RelatedModel` fields
* `<Field />` component now supports sub-fields, e.g. `address.address1`
* `<SaveAction />` now triggers validation before saving

### 0.19.0 - 15th June 2018

**`rev-models`**

* `ModelManager.isNew()` throw better error when model is null or undefined
* `ModelManager.register()` now does a test instantiation of the model, and throws an error if the constructor sets any default values
* Added `IModel.defaults()` method, to be used for setting default field values
* Added `ModelManager.getNew()` method, for returning models with default values applied

**`rev-ui`**

* Add a `defaultAction` prop for `<PostAction />`, `<SaveAction />`, etc. components
* `<DetailView />` now applies default values set in `IModel.defaults()`

**`rev-ui-materialui`**

* MUISelectField - store `null` instead of empty string when empty option is selected

### 0.18.0 - 6th June 2018

* Build fix: clean lib/** before building

**`rev-api`**

* Export IModelApiManager interface from `rev-api` root

**`rev-ui-materialui`**

* Update to @material-ui/core and @material-ui/icons @ 1.x

### 0.17.0 - 13th May 2018

* Upgraded to latest devDependencies
* Added support for TypeScript `strict` mode
* Added seperate `Params` interfaces for `IBackend` methods

**`rev-ui-materialui`**

* Upgrade to `material-ui@1.0.0-beta.41` 
* Upgrade to `@material-ui/icons@1.0.0-beta.42`

### 0.16.3 - 10th April 2018

**`rev-ui-materialui`**

* Added `MUIBooleanField` (checkbox)
* Added `<SearchField />` for `BooleanField`

### 0.16.2 - 1st April 2018

* README updates

### 0.16.1 - 31th March 2018

**`rev-ui-materialui`**

* Added `<SearchField />` for `SelectField`
* Added `<SearchField />` for `DateField`

### 0.16.0 - 30th March 2018

**`rev-models`**

* The `_like` query operator is now case-insensitive by default

**`rev-ui` & `rev-ui-materialui`**

* Added new `<SearchView />`, `<SearchField />` and `<SearchAction />` components.
* Update Docs & Examples

### 0.15.2 - 30th March 2018

**`rev-ui`**

* Added `MUIDateField` component

### 0.15.1 - 30th March 2018

**`rev-ui`**

* Added missing `@types/prop-types` dependency

### 0.15.0 - 25th March 2018

**`rev-ui`**

* Exported 'Component' interfaces from the root, for easier use
* `IListViewComponentProps` now generic to enable types on props.records
* `ListView.fields` prop now optional
* IListViewComponentProps.records -> results (to be consistent with IModelOperationResult)
* UI Components now support pass-through of standard properties (e.g. style)
* Added `MUISelectField` and `MUIRelatedModelField` implementations

### 0.14.0 - 18th March 2018

**`rev-ui`**

* Refactoring to make ListView and DetailView consistent
* IModelContext -> IDetailViewContext
* Added initial API documentation

### 0.13.0 - 17th March 2018

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
* `<ListView />` supports RelatedModelFields (uses toString() on the class)

### 0.12.0 - 11th March 2018

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