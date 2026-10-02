# Navigation design

Information architecture phản ánh mental model và nhiệm vụ của người dùng, không phải cấu trúc code. Nhóm mục theo công việc liên quan, dùng nhãn ngắn và cụ thể, và làm active location rõ ràng. Giữ primary navigation ổn định; tránh nesting sâu hoặc tabs chỉ để chia khối nội dung tùy tiện.

Tái dùng layout có sẵn. Nếu cần đề xuất layout admin mới, sidebar + header + main content là default hợp lý; sidebar collapse vẫn giữ icon và accessible label. Breadcrumb chỉ dùng cho hierarchy sâu hoặc khi giúp người dùng quay lại bối cảnh; không thêm như chrome trang trí.

Tabs dành cho các view ngang hàng trong cùng một context, không thay route/page hierarchy phức tạp. Điều hướng phải dùng được bằng keyboard, focus rõ, responsive và không làm action quan trọng bị che trên viewport nhỏ.
