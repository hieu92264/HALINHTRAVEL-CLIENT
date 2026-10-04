# Prototype guidelines

## Hai loại prototype

`ISOLATED`: tạo trong `.ui-prototypes/`, disposable và độc lập production. Cấu trúc gợi ý gồm gallery `index.html`, màn hình theo domain, `screenshots/` nếu có render và specification khi cần. Dùng mock data có ngữ cảnh và liên kết mọi screen từ gallery.

`PROJECT_NATIVE`: chỉ dùng khi người dùng muốn prototype sát production hoặc tái sử dụng component thật. Sau khi inspect project, đặt nó trong thư mục dev-only/phù hợp convention, tái dùng theme, tokens, layout, UI/icon library hiện có. Không thêm prototype vào production navigation hay route tự động; mọi route xem prototype phải được chỉ rõ là development-only.

## Source of truth và starter assets

HTML/code prototype là source of truth. Có thể bắt đầu từ `assets/prototype/base.html`, `styles.css` và `prototype.js`, nhưng thay đổi template theo workflow và visual language của project; template không phải design system bắt buộc. Không thêm package mới nếu chưa cần thiết.

Khi browser/screenshot capability có sẵn, render và review ở desktop 1440×900, tablet 1024×768 và mobile 390×844. Lưu artifact tại `.ui-prototypes/screenshots/` với tên mô tả; không nói đã tạo screenshot nếu không có khả năng. Screenshot không thay thế code source.

## Hoàn tất

Trước khi bàn giao, kiểm tra luồng chính, hierarchy, primary action, form/table state, responsive, keyboard/focus và consistency. Nêu rõ entry point, mock-data limitation và điểm nào chưa mô phỏng production.
