# Giai đoạn 2 — Khóa học, Phòng, Lớp và Lịch

Cập nhật 04/11/2026. Các màn giai đoạn 2 đã chuyển sang API thật qua Gateway.
UI dùng Ant Design và styled-components, tiếp tục sử dụng ManagementLayout, services/hooks/types theo cấu trúc dự án.

## Chức năng đã triển khai

| Màn | Chức năng |
|---|---|
| Khóa học | Danh sách, tìm mã/tên, lọc trạng thái/chi nhánh, phân trang server, tạo/sửa, xem chi tiết và mở/đóng |
| Phòng học | Danh sách, tìm kiếm, lọc trạng thái/chi nhánh, tạo/sửa, chi tiết, bảo trì/sử dụng và xóa phòng chưa gán lớp |
| Lớp học | Danh sách, tìm kiếm, lọc tiến độ/đủ chỗ/chi nhánh, tạo/sửa, chi tiết, kết thúc/khôi phục và xóa lớp chưa có đăng ký |
| Chi tiết lớp | Thông tin, lịch tuần và danh sách học viên đang học từ API |
| Lịch học | Danh sách lịch tuần, lọc lớp/ngày/giáo viên/phòng/chi nhánh; thêm/sửa/xóa và xem trước xung đột |
| Teacher | Lớp của tôi, chi tiết lớp và lịch dạy thật; backend giới hạn theo giáo viên đăng nhập |

Super Admin có thể tạo khóa chung hoặc khóa theo chi nhánh.
Sửa khóa không chuyển phạm vi; sửa phòng/lớp không chuyển chi nhánh.

Không có nút xóa khóa vì backend chưa có API này.
Số liệu đếm lấy từ totalElements của server; các dropdown nguồn dữ liệu tải đủ trang, không giới hạn ở 200 bản ghi đầu.

## Quyền thao tác

| Thao tác | SUPER_ADMIN | ADMIN | STAFF | TEACHER |
|---|---|---|---|---|
| Tạo khóa học | Khóa chung/chi nhánh | Chi nhánh mình | Không | Không |
| Sửa/mở/đóng khóa | Cả khóa chung | Chỉ khóa chi nhánh | Khóa chi nhánh, không đổi học phí | Không |
| Quản lý phòng | Theo chi nhánh chọn | Chi nhánh mình | Chi nhánh mình | Không |
| Tạo lớp | Có, có thể kèm lịch | Có, có thể kèm lịch | Không kèm lịch | Không |
| Sửa lớp đã có | Có | Có | Chỉ mã, tên, sĩ số tối đa | Không |
| Kết thúc/khôi phục lớp | Có | Có | Không | Không |
| Xóa lớp chưa có đăng ký | Có | Có | Có | Không |
| Tạo/sửa/xóa lịch | Có | Có | Không | Không |
| Xem lớp/lịch | Theo phạm vi | Chi nhánh mình | Chi nhánh mình | Lớp được phân công |

Server xác minh lại mọi quyền và điều kiện nghiệp vụ.

## Luồng tạo lớp

1. Chuẩn bị khóa OPEN, phòng AVAILABLE và giáo viên khả dụng cùng chi nhánh.
2. Chọn khóa, giáo viên và phòng bằng dữ liệu thật; teacherId là profileId.
3. Chọn ngày bắt đầu/kết thúc và sĩ số tối đa.
4. Manager có thể thêm lịch tuần ban đầu; Staff tạo lớp rồi nhờ Manager xếp lịch.
5. Khi có lịch ban đầu, frontend gọi preview trước khi POST lớp.
6. Backend lưu lớp và các slot trong cùng transaction, kiểm tra lại sức chứa và xung đột.

Sĩ số không vượt giới hạn khóa/phòng và không thấp hơn số học viên hiện có.
Tiến độ UPCOMING/ONGOING/FINISHED được tách khỏi cờ full; không đặt FULL thủ công.
Manager chỉ khôi phục tiến độ phù hợp ngày học. Các ngày được gửi dưới dạng YYYY-MM-DD, giờ HH:mm.

## Luồng điều chỉnh lịch

- Mở Lịch học hoặc link từ chi tiết lớp để lọc theo classId.
- Mỗi lớp tối đa một buổi trong cùng ngày trong tuần.
- Kiểm tra xung đột trước khi lưu, gồm giáo viên, phòng và học viên theo backend.
- Preview không thay thế kiểm tra tại thời điểm lưu; lỗi 409 vẫn được hiển thị.
- Sửa slot giữ nguyên classId và gửi excludeScheduleId khi preview.
- PUT lớp luôn bỏ schedules; sửa tên/sĩ số hoặc phân công lớp không ghi đè lịch tuần.
- Khi đổi giáo viên/phòng/ngày của lớp, backend kiểm tra lại các lịch đã có.

Màn lịch hiện là lịch lặp theo tuần với khoảng ngày lớp. Calendar sự kiện theo from/to,
nghỉ lễ/buổi bù và nhiều slot cùng ngày chưa thuộc phạm vi này.
Xung đột học viên có kiểm tra backend; luồng ghi danh với dữ liệu thật tiếp tục được nghiệm thu ở giai đoạn 3.

## Sửa backend đi kèm

CourseService đã được điều chỉnh:

- Khóa theo chi nhánh chỉ tạo/sửa khi chi nhánh ACTIVE.
- Khóa branch trước course, cùng thứ tự với tạo lớp.
- Sau khi refresh dữ liệu dưới khóa mới kiểm tra quyền giữ nguyên học phí của Staff.
  Tránh request giá cũ của Staff ghi đè giá Admin vừa cập nhật khi hai thao tác diễn ra đồng thời.

Cần khởi động lại academic-service để tiến trình đang chạy nhận thay đổi này.
Không tự dừng tiến trình của người dùng hoặc đổi các cổng 8080/8081/8082.

## Vị trí code

- src/types/academic.ts — DTO giai đoạn 2, tách khỏi model mock còn dùng ở giai đoạn sau.
- src/services/academicService.ts — Course/Room/Class/Schedule và tải đủ trang.
- src/utils/academic.ts — nhãn, quyền khóa chung, tiến độ ngày Việt Nam, kiểm tra draft slot.
- src/components/Common/Academic — bộ chọn chi nhánh, lỗi tải và kết quả xung đột.
- src/pages/CourseManagement, RoomManagement — các màn quản lý.
- src/pages/ClassManagement/ClassForm.tsx — form và lịch ban đầu.
- src/pages/ClassManagement/ClassDetails.tsx — Drawer thông tin/lịch/học viên.
- src/pages/ScheduleManagement — lịch tuần và form điều chỉnh slot.

## Xác minh

- 25 test frontend đạt, gồm 7 test mới về quyền, tiến độ, slot, payload PUT, phân trang và cancellation.
- 10 test Academic đạt trên H2/mock, gồm 3 test mới về chi nhánh INACTIVE, giá cũ của Staff và thứ tự lock.
- 40 kiểm tra trình duyệt/API đạt qua các service đang chạy và MySQL:
  tạo/sửa khóa, khóa chung, phòng, lớp, lịch, quyền 4 role, profileId giáo viên,
  giới hạn sĩ số, xung đột giáo viên/phòng, giờ liền kề, sửa/xóa slot,
  tạo lớp kèm lịch, chi tiết lớp, cascade lịch khi xóa lớp và trạng thái phòng.
- Thêm kiểm tra HTTP trên Academic vừa build: chi nhánh INACTIVE bị chặn tạo khóa với 400.
- Production build và lint các file giai đoạn 2 đạt. Ba lỗi lint cũ ở Attendance/Lead còn thuộc giai đoạn sau.
- Dữ liệu thử đã dọn: khóa/phòng/lớp/lịch trở về trống; giữ 4 tài khoản và chi nhánh CN01.

## Chạy và bước tiếp theo

Giữ Auth 8081, Academic 8082 và Gateway 8080 hoạt động. Khởi động lại Academic sau thay đổi backend:

```powershell
# Trong academic-service, dừng tiến trình cũ bằng Ctrl+C rồi chạy:
mvn spring-boot:run
```

Frontend:

```powershell
npm run dev
npm test
npm run build
```

Giai đoạn 3: Lead → Student → Enrollment, bảo lưu/học lại/chuyển lớp và trạng thái tạo học phí.
Các màn Lead/Student/Enrollment/Attendance cũ vẫn cần tích hợp API; danh sách lớp mock
trong các màn đó chưa tự đồng bộ với dữ liệu lớp thật vừa triển khai.
