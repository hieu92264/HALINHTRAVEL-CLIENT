# UX principles

## Bắt đầu từ công việc, không phải phong cách

Trước visual design, xác định ai dùng màn hình, họ muốn hoàn thành gì, hành động thường xuyên/quan trọng nhất, thông tin cần nhìn đầu tiên, quyết định cần đưa ra, state workflow, thao tác lặp lại, lỗi nhập liệu có thể xảy ra và action nguy hiểm. Nếu các câu trả lời chưa rõ, nêu giả định hoặc hỏi câu hỏi ngắn có tác động đến thiết kế.

Mỗi màn hình cần hierarchy có chủ đích: page context, title, summary khi cần, primary action, toolbar/filter, main content, rồi secondary content. Thông thường chỉ có một primary action. Không làm mọi element có visual weight như nhau.

## Thiết kế business application

Ưu tiên UI compact nhưng dễ đọc, nhiều thông tin nhưng dễ scan, giảm click không cần thiết và tối ưu việc lặp lại. Bảng, list và workflow thường phù hợp hơn lưới card đồng dạng. Dùng mock data thực tế theo domain, không dùng dữ liệu vô nghĩa như “User 1”.

Trạng thái luôn có nhãn text cùng màu semantic; màu không phải kênh truyền nghĩa duy nhất. Loading, empty và error là các trạng thái thiết kế bắt buộc, không phải phần phụ.

## Hierarchy và visual restraint

Tái dùng typography scale, spacing, border radius, elevation và tokens của project. Nếu project chưa có visual language, chọn phong cách professional, clean, readable, information-dense và ít nhiễu trang trí. Tránh generic AI dashboard, gradient vô cớ, glassmorphism, card lồng card, khoảng trống quá lớn, shadow/radius quá mức và animation chỉ để trang trí.

Motion chỉ phản hồi hành động hoặc làm rõ state change; hỗ trợ `prefers-reduced-motion`. Icon bổ sung nghĩa, không thay text ở action dễ gây mơ hồ; icon-only control cần accessible name và tooltip khi hữu ích.
