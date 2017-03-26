# RevJS Roadmap

## v0.1.0

* Full In-memory CRUD for `rev-models`

## v0.2.0

* Documentation!

## Other Future Releases

Queries
 * Support `$not` operator
 * RelatedRecord and RelatedRecordList fields (for model relations)

View modules
 * Support for readonly + hidden fields (with conditional function/expressions)
 * Radio / checkbox option for (multi-)select fields
 * Support for Size option

General
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
