---
name: laravel-form-request-schema
description: Create or update Vue Zod create/update schemas from Laravel Create and Update Form Request classes. Use for this project's Laravel-backed CRUD validation contracts; do not use for API services, Vue Query, or CRUD screens.
---

# Laravel Form Request to Zod schema

Translate matched `Create…Request` and `Update…Request` classes into this project's `create-<resource>.schema.ts` and `update-<resource>.schema.ts`.

## Read the contract first

- Read both Request classes in full, including `prepareForValidation`, `rules`, `attributes`, and `toDTO`.
- Inspect the matching frontend enum, type, and nearby schemas before editing. Reuse the module's imports, messages, and Zod conventions.
- Treat `toDTO` defaults as create defaults. Do not infer a default from `sometimes`.
- Keep server-only constraints, such as `unique`, in Laravel. Report them; do not invent an availability endpoint or asynchronous client validator.

## Build the schemas

- Create schemas require fields marked `required`; update schemas permit only fields marked `sometimes` and must be partial.
- Preserve `nullable` as `null` only where the Request allows it. Normalize trimmed blank nullable text and emails to `null` when the local schema pattern does so.
- Translate string length, email, enum, integer, decimal precision, min, max, and boolean rules exactly. For number inputs, accept string form values through preprocessing but reject blank numeric inputs unless the backend/default explicitly permits them.
- Derive enum validation from an existing TypeScript enum. If the frontend enum is missing or incompatible, report that dependency instead of inventing values.
- Override defaulted create fields in the update schema with optional non-default versions so omitted PATCH keys stay omitted. Include `is_active` only when the update Request accepts it.
- Export `Create<Resource>Dto` and `Update<Resource>Dto` with `z.infer`.

## Finish safely

- Change only the requested schema files unless a necessary type import cannot resolve.
- Run `npm.cmd run type-check` after editing.
- Report validation covered by the client, defaults derived from DTOs, and server-only rules left to Laravel.
