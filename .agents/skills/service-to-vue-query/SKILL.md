---
name: service-to-vue-query
description: Create or update TanStack Vue Query list and mutation composables from an existing TypeScript CRUD service. Use for this project's Vue service-to-query wiring; do not use to design APIs or build CRUD page UI.
---

# Service to Vue Query composables

Generate or update `use<Resource>Queries.ts` and `use<Resource>Mutation.ts` from an existing CRUD service in this project.

## Inspect before wiring

- Read the complete service, its matching create/update DTO schemas, frontend entity type, and a completed module's query/mutation composables.
- Confirm the list, create, update, and delete/deactivate methods and their actual payload types before writing wrappers.
- Use local API documentation to resolve an endpoint casing or path conflict. Do not alter endpoint paths based only on method or class names.
- Add missing schema DTO imports to the service as `import type` only when its public method signatures already reference them.

## Composable shape

- Export `<resource>QueryKeys` with `all` as one readonly array based on the API resource name, for example `['vehicle-types'] as const`.
- Export `use<Resource>Query()` using `useQuery`, the shared key, and the service list method.
- Export create, update, and delete/deactivate mutations. The update mutation accepts `{ id: number; data: Update<Resource>Dto }`; delete/deactivate accepts `id`.
- In every `onSuccess`, call `queryClient.invalidateQueries({ queryKey: <resource>QueryKeys.all })`. Never wrap the key in another array.
- Preserve service behavior: a deactivate service method yields a deactivate mutation; do not add optimistic updates, toast messages, UI state, or reactivation controls.

## Finish safely

- Do not create Page, Table, Modal, schemas, types, columns, or backend endpoints as part of this task.
- Run `npm.cmd run type-check` after editing.
- Report the chosen key, wrapped service methods, and unresolved API-contract ambiguity.
