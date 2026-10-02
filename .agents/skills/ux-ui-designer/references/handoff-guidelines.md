# Frontend handoff

Chỉ tạo handoff sau khi direction đủ rõ hoặc được approve. Handoff mô tả thiết kế để implementer không phải đoán; không tự chuyển sang production implementation khi người dùng chỉ yêu cầu tài liệu.

Với mỗi screen, specification nên gồm:

```markdown
# UI Specification: [Screen]

## Goal
## Route / entry point
## Layout and hierarchy
## Page header and primary action
## Toolbar, search and filters
## Main content: table, form, detail or dashboard
## Row actions, dialogs and confirmations
## Interaction rules
## Loading, empty and error states
## Responsive behavior
## Accessibility
## Existing components to reuse
## Suggested component mapping
## Open decisions / known limitations
```

Component mapping phải dựa trên kết quả inspect, chỉ nêu component thực sự có trong project. Ghi rõ labels, action hierarchy, validation, state transitions, status semantics, permission-dependent visibility nếu được cung cấp, và mock-vs-real data boundary. Nếu có nhiều screen, nêu shared components, navigation relationship và thứ tự flow.
