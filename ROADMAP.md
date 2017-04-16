# RevJS Roadmap

## v0.1.0

* Full In-memory CRUD for `rev-models`
* GraphQL API backend (server + client)

## v0.2.0

* MongoDB Backend
* Default field values
* Knowledge of Primary Key
* Documentation!

## Other Future Releases

Queries
 * Support `$not` operator
 * Support `$regexp` operator
 * Case-insensitive queries (option for operation methods?)
 * RelatedRecord and RelatedRecordList fields (for model relations)

View modules
 * Support for readonly + hidden fields (with conditional function/expressions)
 * Radio / checkbox option for (multi-)select fields
 * Support for Size option

General
 * Make sure some checks are in place to ensure API functions aren't leaked to the client
 * Strategy to support timezones?
 * Add support for NODE_ENV=production for removing developer-error checks (minimises code size)

Possible future extra modules
 * rev-model-auth - access control for rev models
 * rev-admin - auto-generated admin interface for CRUD on rev models (Hapi)
 * rev-model-migrations - database schema updates based on rev metadata
 * rev-cli - scaffold rev-based projects (react, angular, ...), run migrations...

Backends
 * MongoDB
 * MySQL
 * PostgreSQL
