---
name: frontend-crud
description: Build Vue CRUD Page, Table, and Modal components when the project already provides the service, types, schemas, query composables, and column definitions. Use for Vue apps with a DataGrid and Laravel-style API contracts; do not use to design backend APIs or domain models.
---

# Frontend CRUD

Build the UI layer of a CRUD module from its existing frontend domain layer and backend validation contract. The user owns the API/domain setup; this skill owns the Page, Table, and Modal integration.

## Start with the contract

Before implementing, ask the user to provide the Laravel `Create...Request` and `Update...Request`, or ask permission to inspect them. Use these requests and the controller/service behavior to determine required fields, nullable fields, enum values, PATCH semantics, and whether `DELETE` is a true deletion or a status change.

Then verify that the module already has all of the following:

- API service
- domain type
- create and update schemas
- Vue Query query and mutation composables
- `column.ts` / column definition file

If an input is missing, report its exact path or category and stop. Do not create service, types, schemas, composables, or columns. If columns are absent or incomplete, suggest columns inferred from the contract and wait for the user's confirmation before changing a type or column file.

## Build the UI

- Keep page/container state in the Page: open state, row being edited, confirmation target, mutations, and toast feedback.
- Make the Table use the existing DataGrid, columns, and query composable. Provide toolbar actions for create/filter/column visibility when the DataGrid supports them. The Table emits semantic events such as `create`, `edit`, and `deactivate`; it does not call mutations directly.
- Make the Modal reset form values whenever it opens or the selected row changes. Use the supplied schemas and render only fields supported by the backend contract.
- Create submits the prepared create DTO. Update compares normalized form values with the selected row and sends a minimal PATCH; intentionally cleared nullable fields must be sent as `null`, while unchanged fields are omitted.
- Keep the modal open when a request fails and surface the failure. Show destructive confirmation only where the backend behavior warrants it.
- Implement deactivate/reactivate only if the contract explicitly provides those behaviors (for example, DELETE deactivates and PATCH accepts `is_active`).

## Cache and verification

- Query keys must be shared between the query and mutations. Pass the actual key to `invalidateQueries`, not an extra nested array around it.
- Preserve module-specific business rules; do not copy Customer fields such as CCCD, tax code, opening balance, or activation controls unless the new contract requires them.
- Run the repository's required type-check and production build after changes, plus relevant tests when available.

For an example of these patterns, read [the Customer CRUD reference](references/customer-crud-pattern.md).
