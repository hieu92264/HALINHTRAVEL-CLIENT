# Data table design

Chọn table cho dữ liệu cần so sánh, scan và thao tác lặp lại. Chỉ thêm search, multi-filter, sort, pagination, selection, bulk action, column visibility, sticky header, refresh hay export khi chúng phục vụ workflow đã biết.

Đặt text bên trái; number, quantity và money bên phải; action nhất quán (thường bên phải); status bằng nhãn/badge rõ ràng. Không căn giữa toàn bộ bảng. Giữ cột thường dùng dễ thấy; đưa action hiếm vào menu. Search phải nêu scope, ví dụ tên/điện thoại/mã thay vì “Search…”.

Filter đơn giản ở toolbar, active filters nhìn thấy được và có clear. Filter phức tạp có thể dùng popover hoặc advanced filter nhưng các filter quan trọng vẫn phải dễ tới. Thiết kế rõ loading skeleton, empty state theo ngữ cảnh, error/retry và trạng thái selection/bulk action.

Trên màn hình nhỏ, không thu font đến mức khó đọc. Giảm cột phụ, cho horizontal scroll có chủ đích hoặc chuyển thành card/list khi việc so sánh theo cột không còn thiết yếu. Giữ row action và nhận diện bản ghi truy cập được.
