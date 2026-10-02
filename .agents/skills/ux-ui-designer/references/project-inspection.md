# Project inspection

## Mục tiêu

Trước thiết kế hay implement UI trong project có sẵn, tìm source of truth để UI mới trông và hoạt động như một phần của ứng dụng. Không suy đoán stack từ yêu cầu của người dùng.

## Khảo sát tối thiểu

Kiểm tra `package.json`; `src/` và các thư mục `components`, `components/ui`, `layouts`, `pages` hoặc `views`, `router`, `assets`, `styles`, `composables`; cùng `components.json`, `tailwind.config.*`, `vite.config.*` và `tsconfig.*` nếu hiện diện. Tìm:

- framework, component library, CSS framework và icon library;
- design tokens, CSS variables, typography, dark/light theme và spacing/radius;
- layout, navigation, page header, form, table, dialog/drawer, empty/loading/error state;
- responsive breakpoints, naming/import convention và một hoặc vài page tương tự.

## Cách dùng kết quả

Nêu ngắn gọn stack phát hiện được và những component/layout sẽ tái dùng. Nếu có Tailwind + shadcn-vue, ưu tiên component và token của chúng; nếu stack khác, dùng abstraction tương đương của stack đó. Không tạo design system song song, không thêm package chỉ để prototype và không refactor shared component nếu composition cục bộ đáp ứng được.

Trước mọi edit project-native, xác định file sẽ thay đổi, dependency của chúng và ảnh hưởng tới shared UI. Đối chiếu với ít nhất một page/component hiện hữu về padding, heading, toolbar, table density, button hierarchy, dialog, spacing và status style.
