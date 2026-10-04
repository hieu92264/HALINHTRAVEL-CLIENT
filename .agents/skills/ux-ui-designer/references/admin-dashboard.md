# Admin dashboard

Dashboard phải trả lời nhanh: điều gì cần chú ý, việc nào cần làm ngay và người dùng nên hành động gì tiếp theo. Không biến dashboard thành tập hợp KPI card giống nhau.

Ưu tiên theo workflow: alert/action queue, số liệu quyết định, xu hướng hoặc tiến độ có ngữ cảnh, và danh sách công việc gần đây. Dùng card khi nó đại diện cho một summary hoặc decision riêng; dùng table/list/timeline cho dữ liệu dày và thao tác lặp lại. Đặt action trực tiếp gần dữ liệu khi hành động đó thường xuyên.

Thiết kế filter theo phạm vi rõ ràng và cho thấy active filters. Mọi metric cần label, khoảng thời gian và đơn vị rõ ràng; tránh biểu đồ nếu table hoặc số tổng hợp trả lời câu hỏi tốt hơn. Bảo đảm loading skeleton giữ cấu trúc, empty state chỉ ra bước bắt đầu và error state có retry khi phù hợp.
