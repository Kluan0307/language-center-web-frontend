# Sidebar và phân quyền điều hướng

> Giai đoạn 1 và 2 đã hoàn thiện ngày 04/11/2026. Xem [giai đoạn 2](phase-two.md). Xem [trạng thái mới nhất](phase-one.md); các mô tả prototype bên dưới là từ đợt sidebar ban đầu.

Cập nhật 02/11/2026. Nguồn quyền điều hướng là `src/config/navigation.ts`.
Sidebar, dashboard và route guards cùng dùng cấu hình này.

| Role | Phạm vi | Menu |
|---|---|---|
| SUPER_ADMIN | Toàn hệ thống | Tổng quan, Chi nhánh, Tài khoản, Giáo viên, Nhân viên, Lead, Học viên, Khóa, Lớp, Phòng, Lịch, Xếp lớp, Điểm danh, Kiểm tra, Điểm/đánh giá, Tài liệu, Học phí, Phiếu thu, Báo cáo |
| ADMIN | Chi nhánh trong tài khoản | Như Super Admin, trừ quản lý Chi nhánh |
| STAFF | Chi nhánh trong tài khoản | Tổng quan, Giáo viên khả dụng, Lead, Học viên, Khóa, Lớp, Phòng, Lịch, Xếp lớp, Điểm danh, Tài liệu đã duyệt, Học phí, Phiếu thu |
| TEACHER | Lớp được phân công | Tổng quan, Lớp của tôi, Lịch dạy của tôi, Điểm danh, Kiểm tra, Bảng điểm, Tài liệu của tôi |

## Hành vi

- Truy cập route trái quyền chuyển đến trang 403; đường dẫn không có hiển thị 404.
- Chưa đăng nhập chuyển về login; khi tải phiên hiển thị loading.
- Login, reload và sidebar dùng role/profile/branch trả từ me, không tin user cache cũ.
- Nhãn role tiếng Việt và branchId hiển thị ở đầu sidebar; SA hiển thị toàn hệ thống.
- /overview là alias /dashboard; /stats chỉ giữ alias cho SA/A/S.
- /grades với Teacher là bảng điểm, không hứa quyền gọi evaluation report của Admin.
- Staff có cả Học phí và Phiếu thu; không có tài khoản, điểm hoặc báo cáo tài chính.
- Quyền menu không thay thế xác thực backend hoặc quyền trên từng đối tượng.

## Trạng thái màn hình

Đợt này triển khai sidebar, dashboard lối tắt, route guards và auth DTO 4 role.
Các trang đã có trước vẫn là nguyên mẫu dùng mock; chưa chuyển toàn bộ sang API thật.
Các trang chưa xây dựng hiển thị đúng tên chức năng, mô tả theo role và thông báo đang triển khai.
Không hiển thị số liệu dashboard giả.

Attendance của Teacher và directory Teacher của Staff tạm dùng trang đang triển khai:
màn mock cũ không có ràng buộc lớp/chi nhánh hoặc chế độ chỉ xem tương ứng.
Khi tích hợp API thật, thay bằng màn có scope từ server trước khi bật lại.

Các nút thao tác trong màn mock cũ chưa được chuẩn hóa toàn bộ theo quyền backend.
Không coi việc mở được trang là đã có đủ CRUD production.

## Kiểm tra

```powershell
node --test tests/navigation.test.mjs
npm run build
```

Test xác minh menu và route matrix cho cả 4 role, role lạ bị từ chối, ID/path duy nhất,
nhãn riêng của Teacher và App lấy quyền từ cùng cấu hình.
ESLint kiểm tra các file đã sửa; repo còn lỗi cũ ở các màn/hook chưa thuộc đợt này.

## Kiểm tra thủ công

1. Đăng nhập lần lượt superadmin/admin/staff/teacher; kiểm tra menu theo bảng.
2. Reload, xác nhận menu và branch vẫn đúng. Đăng xuất phải quay về login.
3. Staff nhập /accounts, /grades, /reports, /branches: phải thấy 403.
4. Teacher nhập /students, /classes, /tuition, /payments: phải thấy 403.
5. Admin nhập /branches: phải thấy 403; Super Admin mở được.
6. Chọn mục chưa triển khai: hiển thị đúng tiêu đề, không render Overview chung.
7. Nhập URL không tồn tại: 404; /overview chuyển /dashboard.

## Cập nhật giai đoạn 1 — 04/11/2026

Chi nhánh, Tài khoản, Nhân viên và Giáo viên đã có màn gọi API thật. Staff xem directory giáo viên khả dụng.
Phiên đăng nhập và hồ sơ đã được hoàn thiện. Xem [Giai đoạn 1](phase-one.md) để biết trạng thái mới nhất.
Các mô tả màn mock phía trên ghi nhận trạng thái sau đợt sidebar ban đầu.
## Cải thiện nhiều chi nhánh

Menu chức năng theo role giữ cấu hình chung. Bộ chọn chi nhánh trên sidebar xác định phạm vi làm việc của Admin/Teacher; Staff có tối đa một lựa chọn. Quyền chi tiết xác minh theo phân công hiện tại ở backend. SUPER_ADMIN phân công qua nút Chi nhánh ở danh sách tài khoản; Admin không tự phân công.

## Cải thiện 3

Sidebar giữ cấu trúc hiện tại. Lịch học của SA/A/S mở danh sách buổi; Teacher mở lịch được giao thực tế, gồm dạy thay. Chỉ SA/A thấy thao tác quản lý buổi và mẫu tuần. Staff ghi lần đầu; chỉ SA/A sửa điểm danh đã hoàn tất với lý do. Teacher dạy thay truy cập roster điểm danh của buổi, không được quyền toàn lớp.

## Cải thiện 4

Giữ sidebar hiện tại. SA/Admin/Staff quản lý vòng đời ở Học viên và Đăng ký & xếp lớp; Teacher không thấy các thao tác này. SA/Admin/Teacher xem roster tại Bảng điểm; Teacher phụ trách nhập điểm ban đầu từ ngày thi, SA/Admin chỉ sửa điểm có sẵn. Người dạy thay một buổi không được quyền dự thi/điểm của cả lớp.

## Cải thiện 5

Giữ sidebar. Staff thu và đọc lịch sử; SA/Admin mới điều chỉnh, đảo phiếu, hoàn và đối soát trong phạm vi phân công. Teacher không có trang tài chính. Banner yêu cầu chờ dùng chung ở Học phí/Phiếu thu; không tạo giao dịch mới khi chưa xác nhận yêu cầu cũ.

## Cải thiện 6

CRM: Staff đọc cùng chi nhánh, chỉ sửa lead được giao; Admin/Super Admin bàn giao người phụ trách. Có lịch hẹn/quá hạn và lịch sử. Teacher gửi lại tài liệu REJECTED của mình; quản lý duyệt version đang xem. Staff chỉ đọc APPROVED hiện tại, không xem revision/history. Form cảnh báo bỏ thay đổi; chưa chặn mọi điều hướng nội bộ. 72 tests, lint/build đạt; đã kiểm tra UI theo bốn role và file cũ/mới. [Chi tiết backend và V006](../../language-center-backend/language-center-backend/docs/improvements/phase-six-care-documents-experience.md).

## G02–G03

/teachers: SA/Admin mở TeacherProfilePanel từ Xem, có canManage theo toàn bộ phân công. Admin partial chỉ đọc; Staff vẫn TeacherDirectory tối thiểu; Teacher không được trang quản trị. Tab bàn giao/lịch sử và nút sửa/ngừng chỉ người đủ quyền, backend kiểm tra lại. Không thêm role hoặc sidebar mới.

## Bổ sung G04/G05 — 08/11/2026

Giữ sidebar hiện có. SA: danh mục chương trình/trình độ trong trang Khóa học; SA/A: cấu hình policy khóa và áp dụng snapshot lớp theo scope; SA/A/S: tab Đánh giá đầu vào trong hồ sơ Học viên. Staff đọc điều kiện nhưng không xác minh policy; Teacher không được cấp thêm trang CRM/assessment. API kiểm tra role và phạm vi độc lập với nút FE.

## G06/G07 — 08/11/2026

Giữ sidebar: **Đăng ký & xếp lớp** cho SA/A/S. Staff đề nghị/xem/dùng ngoại lệ đã duyệt; SA/Admin đúng scope duyệt/từ chối trong hàng đợi của trang. Teacher không có quyền preview/assessment/ngoại lệ CRM. Backend kiểm tra độc lập với nút. Detail enrollment có snapshot; chuyển/học lại đi qua cùng gate.

## G08/G09 — giữ sidebar

SA/A quản lý thời lượng trong trang Khóa học và chi tiết Lớp theo scope, SA quản lý khóa chung; Staff/Teacher chỉ đọc theo quyền. Teacher dạy thay không đọc tổng toàn lớp không phụ trách, chỉ giờ buổi được giao. Lịch lớp hiển thị tổng khi có quyền lớp chính. Không thêm menu độc lập hoặc mở quyền CRM.

## G10 — giữ sidebar

Trong Bài kiểm tra/Bảng điểm/Báo cáo, SA/Admin quản lý policy đúngscope; Teacher xem policy/preview lớp chính và nhập điểm theo quyền cũ, không duyệt policy. Staff không có thêm grade/reportCRM; Teacher dạy thay không được toàn quyền lớp. Không tạo menu mới hoặc tự chốt kết quả cuối khóa.
