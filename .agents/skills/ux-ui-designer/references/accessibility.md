# Accessibility

Dùng semantic HTML trước; bổ sung ARIA chỉ khi semantic không đủ. Mọi interactive element cần accessible name, keyboard operation và focus state dễ thấy. Icon-only control cần `aria-label` hoặc text ẩn; tooltip không phải nguồn thông tin duy nhất.

Kiểm tra contrast cho text, icon, border quan trọng và mọi state. Không chỉ truyền nghĩa bằng màu; status, error, required và selection phải có text, shape hoặc context bổ sung. Label gắn với form field; validation/error được liên kết và thông báo không phá workflow.

Dialog/drawer cần focus management, Escape hợp lý, return focus khi đóng và không để background nhận focus. Giữ thứ tự DOM/tab logic, heading hierarchy mạch lạc và vùng table phức tạp có label/context. Animation phải tôn trọng reduced motion; touch target phải đủ kích thước thực tế.
