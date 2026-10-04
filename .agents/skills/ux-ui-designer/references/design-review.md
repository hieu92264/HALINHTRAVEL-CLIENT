# Design review

Review dựa trên evidence từ screenshot, prototype hoặc UI chạy được, không chỉ theo gu thẩm mỹ. Nếu có thể, quan sát các viewport chính và interaction state trước khi kết luận.

Đánh giá layout, hierarchy, navigation, action, form, table, search/filter, spacing, typography, status, loading/empty/error, responsive, accessibility và consistency với project. Ưu tiên usability impact: người dùng có nhìn thấy thông tin và action đúng lúc, hiểu state, hoàn thành task hiệu quả và tránh lỗi hay không.

Nhóm phát hiện theo mức độ:

- `Critical`: chặn task chính, gây mất dữ liệu, action nguy hiểm hoặc không thể dùng với keyboard/screen reader.
- `High`: làm sai quyết định, tăng đáng kể lỗi/click hoặc che thông tin/action quan trọng.
- `Medium`: làm flow chậm, thiếu nhất quán hoặc gây nhầm lẫn có thể khắc phục.
- `Low`: polish, spacing hoặc chi tiết có tác động nhỏ.

Mỗi issue gồm `Problem`, `Why it matters / UX impact` và `Recommended improvement`; ghi location/state khi có. Kết thúc bằng các cải tiến có tác động cao nhất và layout change được đề xuất. Không trình bày preference thẩm mỹ như lỗi khách quan.
