# Customer CRUD pattern

Use this as a UI wiring example only. Its customer-specific fields and validation rules are not reusable defaults.

## Responsibilities

- `CustomerPage` owns the selected row, modal open state, confirmation target, destructive mutation, and toast messages.
- `CustomerTable` renders the DataGrid and emits `create`, `edit`, and `deactivate` events. It exposes filter and column-visibility tools through DataGrid toolbar slots.
- `CustomerModal` receives the selected row, resets its form when opened, and handles create/update mutations.

## Important mechanics

- The form normalizes values before comparing them with the original row. Its PATCH payload contains changed keys only; clearing a nullable text field yields `null`.
- Customer's DELETE endpoint deactivates the record. The UI uses a confirmation dialog and labels the action “Ngừng hoạt động”, rather than “Xóa”. Inactive records can be reactivated only because the backend permits `PATCH { is_active: true }`.
- Vue Query uses `customerQueryKeys.all`, whose value is `['customers']`. Mutations must invalidate with `queryKey: customerQueryKeys.all`; wrapping it in another array produces `[['customers']]` and does not refresh the table.
- `FormControl` wraps the concrete `SelectTrigger`, not the logical Select root, to avoid invalid VNode warnings.
