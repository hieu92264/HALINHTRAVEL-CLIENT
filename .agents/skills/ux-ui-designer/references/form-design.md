# Form design

Luôn dùng label rõ ràng; placeholder không thay label. Nhóm field theo nhiệm vụ hoặc dữ liệu liên quan, dùng heading/section cho form dài và chỉ dùng tabs, stepper hoặc wizard khi chúng thực sự giảm tải nhận thức hay số lỗi.

Hiển thị required state nhất quán, helper text khi cần, validation gần field và cách sửa cụ thể. Bảo toàn dữ liệu người dùng đã nhập khi lỗi có thể; cảnh báo unsaved changes khi rời khỏi form có giá trị. Submit state phải rõ, chống double-submit và chỉ block phần cần thiết.

Chọn container theo độ phức tạp: dialog cho confirm hoặc form ngắn; drawer/sheet cho chỉnh sửa contextual cỡ vừa; page cho form phức tạp, detail nhiều section hoặc workflow dài. Tách destructive action khỏi primary action bằng hierarchy và confirmation tương xứng với rủi ro.

Ưu tiên keyboard: logical tab order, focus khi mở dialog, Enter chỉ submit khi phù hợp, Escape đóng overlay khi an toàn. Trên mobile, stack field hợp lý và giữ action quan trọng dễ tiếp cận.
