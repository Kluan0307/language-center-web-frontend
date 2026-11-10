# Giai đoạn 1 — Tổ chức và tài khoản

Cập nhật 04/11/2026. UI dùng Ant Design và styled-components, theo cấu trúc pages/services/hooks/types hiện có.

## Đã triển khai

- API client dùng Gateway 8080; .env.example được bổ sung và .env local frontend chuyển sang gateway.
- Login xác minh /me trước khi nhận phiên; xử lý sai mật khẩu, 401, mạng lỗi và retry.
- Ghi nhớ đăng nhập dùng localStorage; bỏ chọn dùng sessionStorage. Logout xóa cả hai.
- Tự kết thúc phiên khi JWT hết hạn; request cũ trả 401 không xóa phiên mới.
- Sidebar/route guard 4 role, trang hồ sơ chỉ xem bằng cách bấm tên ở đầu sidebar.
- Chi nhánh: danh sách, tìm mã/tên, phân trang server, tạo/sửa, xem chi tiết, bật/tắt có xác nhận.
- Tài khoản: danh sách, lọc role/chi nhánh (SA), tìm username, phân trang server, tạo, chi tiết và khóa/mở.
- Nhân viên: danh sách tài khoản STAFF thật, tạo hồ sơ và khóa/mở theo quyền.
- Giáo viên cho SA/A: danh sách tài khoản TEACHER thật, có giáo viên đã khóa; chi tiết hồ sơ.
- Giáo viên cho Staff: chỉ danh sách khả dụng từ /auth/teachers; không có nút quản lý.
- Các màn mới có loading, rỗng, lỗi, thử lại, validation form và thông báo kết quả.
- Giao diện Ant Design dùng locale tiếng Việt; styled-components quản lý bố cục dùng chung.

## Quyền

| Thao tác | SUPER_ADMIN | ADMIN | STAFF / TEACHER |
|---|---|---|---|
| Quản lý Chi nhánh | Có | Không có route | Không có route |
| Danh sách Tài khoản | Toàn chuỗi hoặc lọc chi nhánh | Chi nhánh mình | Không có route |
| Tạo tài khoản | ADMIN / STAFF / TEACHER; chọn chi nhánh ACTIVE | STAFF / TEACHER, ép chi nhánh mình | Không |
| Khóa/mở | ADMIN / STAFF / TEACHER | STAFF / TEACHER cùng chi nhánh | Không |
| Hồ sơ bản thân | Chỉ xem | Chỉ xem | Chỉ xem |

Không khóa Super Admin hoặc chính mình. Backend tiếp tục xác minh quyền và phạm vi dữ liệu.
Không có chức năng sửa/xóa hồ sơ nhân sự vì API hiện tại chưa hỗ trợ.
Mật khẩu tạo mới yêu cầu tối thiểu 8 ký tự, tối đa 72 byte UTF-8; các tài khoản seed 123456 vẫn đăng nhập được.

## Cấu trúc

- src/pages/BranchManagement — quản lý chi nhánh.
- src/pages/AccountManagement — tài khoản và danh sách nhân viên/giáo viên theo role cố định.
- src/pages/TeacherDirectory — tra cứu giáo viên cho Staff.
- src/pages/Profile — hồ sơ bản thân.
- src/components/Layout/ManagementLayout — bố cục Ant Design + styled-components dùng chung.
- src/services/branchService.ts, authService.ts — API thật.
- src/hooks/useRemoteResource.ts — tải dữ liệu có hủy request, key theo query và chống hiển thị kết quả cũ.
- src/utils/authStorage.ts, accountPermissions.ts, apiErrors.ts — phiên, quyền hành động và lỗi API.

## Chạy

Chạy Auth 8081, Academic 8082 và Gateway 8080 trong các terminal riêng từ thư mục module backend:

```powershell
mvn spring-boot:run
```

Ở frontend:

```powershell
npm run dev
```

VITE_API_BASE_URL=http://localhost:8080/api/v1. Nếu thay đổi env khi Vite đang chạy thì khởi động lại Vite.
Những chức năng liên quan Finance/Teaching cần chạy thêm service tương ứng khi triển khai giai đoạn sau.

## Xác minh 04/11/2026

- 18 test frontend đạt: sidebar/route, quyền hành động, lưu phiên, expiry, request 401 cũ, lỗi mạng và validation.
- 10 test Auth đạt với H2/mock, gồm context và lỗi nghiệp vụ account management.
- 25 kiểm tra trình duyệt headless qua Gateway + Auth + Academic + MySQL đạt:
  tạo/sửa/bật tắt chi nhánh, mã trùng, từ chối tạo tài khoản ở chi nhánh INACTIVE,
  tạo Teacher bằng SA và Staff bằng Admin, lưu hồ sơ, login, khóa, scope chi nhánh,
  URL trái quyền, hồ sơ, logout, nhớ đăng nhập và phục hồi sau lỗi mạng.
- Các tài khoản/chi nhánh thử đã được xóa; giữ 4 tài khoản và CN01 ban đầu.
- Frontend production build đạt; lint các file giai đoạn 1 đạt.
- Repo còn lỗi lint cũ ở AttendancePage, LeadUpdateModal và LeadsPage; các màn này thuộc giai đoạn sau.
- Backend đã khởi động được bằng Maven trực tiếp và đọc .env.local qua spring.config.import.

```powershell
npm test
npm run build
```

## Tiếp theo

Giai đoạn 2: khóa học, phòng, lớp và lịch dùng API thật, giáo viên khả dụng và kiểm tra xung đột.
Những màn tuyển sinh/học vụ cũ ngoài giai đoạn 1 còn dùng mock.
Tắt chi nhánh không đồng nghĩa thu hồi ngay mọi JWT đã phát; chưa có cơ chế thu hồi token toàn hệ thống.
