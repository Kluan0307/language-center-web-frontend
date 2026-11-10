# Giai đoạn 3 — Tuyển sinh, học viên và ghi danh

Hoàn thành ngày 04/11/2026. Giao diện giữ cấu trúc React/TypeScript hiện có, dùng Ant Design và styled-components qua ManagementLayout.

## Phạm vi đã nối API thật

| Màn hình | Chức năng |
|---|---|
| /leads | Tìm kiếm, phân trang, lọc trạng thái/chi nhánh/Lead của tôi; tạo, sửa, chăm sóc và ghi chú; chuyển học viên; mở hồ sơ sau chuyển đổi |
| /students | Tìm mã/tên/điện thoại/email; tạo/sửa hồ sơ; ngày sinh tùy chọn; người giám hộ; trạng thái hồ sơ; lịch sử đăng ký và liên kết chi tiết |
| /enrollment | Lọc lớp/học viên/trạng thái/chi nhánh; chọn học viên và lớp thật; xem lịch; ghi danh, bảo lưu, học lại, ngừng, hoàn thành, chuyển lớp; xem học phí gốc và thử tạo học phí lại |

Super Admin thao tác theo chi nhánh được chọn. Admin và Staff theo chi nhánh tài khoản.
Teacher không có quyền truy cập ba màn này; cả route guard và backend đều kiểm tra.

Các tùy chọn học viên/lớp được tải đủ trang, không giới hạn ở 200 bản ghi đầu.
Các màn có loading, dữ liệu rỗng, lỗi có nút tải lại, khóa gửi trong lúc lưu và phản hồi kết quả từ server.
URL chi tiết dùng leadId, studentId, classId, enrollmentId; reload vẫn tải dữ liệu từ backend.

## Quy tắc nghiệp vụ

- Lead CONTACTED/CONSULTING mới chuyển đổi. Gọi lại convert trả cùng học viên, không tạo lần hai.
  Lead đã chuyển đổi chỉ đọc; thông tin học viên được chỉnh trong hồ sơ học viên.
- Mã học viên do backend cấp. Không giả ngày sinh khi chưa biết; anh chị em được dùng chung số phụ huynh.
- Trạng thái hồ sơ STUDYING/PAUSED/GRADUATED tách khỏi trạng thái đăng ký lớp.
  Cần bảo lưu/kết thúc mọi đăng ký STUDYING trước khi tạm ngừng/hoàn thành hồ sơ.
  Hồ sơ phải STUDYING để ghi danh, học lại hoặc chuyển lớp.
- Backend kiểm tra chi nhánh, lớp kết thúc, sĩ số, đăng ký trùng và lịch học.
  Xung đột chỉ tồn tại khi ngày học thực sự xuất hiện trong phần giao nhau của thời gian hai lớp.
- STUDYING có thể RESERVED/COMPLETED/DROPPED. RESERVED có thể học lại STUDYING hoặc đóng DROPPED.
  Không mở lại COMPLETED/DROPPED/TRANSFERRED. Đang bảo lưu cùng lớp phải học lại, không ghi danh mới.
- Bảo lưu giải phóng chỗ; học lại kiểm tra chỗ và lịch lần nữa. Các khoảng học được lưu để dùng cho điểm danh lịch sử.
- Chuyển lớp chỉ cùng khóa và chi nhánh, tạo đăng ký kế tiếp và giữ billingEnrollmentId cùng giá gốc.
  Trạng thái tạo học phí trong danh sách/chi tiết đăng ký kế tiếp lấy từ đăng ký tính phí gốc.
- Finance lỗi không rollback ghi danh. POST thành công đóng form, GET chi tiết riêng để xem kết quả tạo học phí.
  Retry trả FAILED dù HTTP 200 phải hiện cảnh báo, không báo thành công.
  Khi POST ghi danh mất phản hồi, form yêu cầu kiểm tra đăng ký đã lưu trước khi gửi lại.
- Bảo lưu/ngừng/hoàn thành không tự hoàn tiền hay hủy công nợ. “Đã tạo học phí” không có nghĩa đã thanh toán.

## Chạy và kiểm tra nhanh

Chạy Auth 8081, Academic 8082, Gateway 8080 và Finance 8084 bằng mvn spring-boot:run trong từng thư mục service.
Frontend dùng VITE_API_BASE_URL=http://localhost:8080/api/v1, chạy npm run dev.

Nếu các service đã chạy trước khi cập nhật mã, khởi động lại Academic để nạp thay đổi.
Finance không chạy: vẫn ghi danh được nhưng cần nút Thử tạo học phí khi Finance hoạt động lại.

Database cũ có thể còn UNIQUE(phone,branch_id), dù entity đã bỏ ràng buộc.
Xem [migration số liên hệ](../../language-center-backend/language-center-backend/docs/migrations/phase-three-student-contact.sql).
Ngày 04/11/2026 đã sao lưu bảng students và áp dụng migration này trên language_center_db hiện tại;
không cần chạy lại cho database đó. Script có thể chạy lại an toàn.

Luồng thử: tạo Lead → chăm sóc → chuyển học viên → bổ sung hồ sơ → ghi danh → bảo lưu → học lại → chuyển lớp.
Tắt Finance để thử lỗi rồi chạy lại Finance và bấm thử tạo học phí, không ghi danh lại.

## Xác minh

- 31 test frontend đạt; TypeScript và production build đạt.
- Lint các file giai đoạn 3 đạt. Full lint còn một lỗi có sẵn tại AttendanceManagement/AttendancePage.tsx
  (set-state-in-effect), thuộc màn mock điểm danh chưa tích hợp.
- Academic: 12 test đạt trên H2, gồm chuyển đổi lặp, trạng thái học, giá/billing root,
  học phí FAILED rồi retry, bảo lưu trước khai giảng và ngày học trong khoảng giao nhau.
- Đã chạy trình duyệt Edge thật và API qua gateway kiểm thử riêng với MySQL:
  Lead/chăm sóc/chuyển đổi, sửa ngày sinh/giám hộ, Staff tạo học viên dùng chung số điện thoại,
  ghi danh khi Finance ngừng, phục hồi tạo đúng một học phí, bảo lưu/học lại/chuyển lớp,
  giới hạn sĩ số, hai request tranh chỗ cuối, cách ly chi nhánh và Teacher bị chặn.
- Dữ liệu fixture được theo dõi bằng ID và dọn sau kiểm thử; không thay dữ liệu người dùng khác.
  Các instance kiểm thử dùng cổng riêng và được dừng sau xác minh.

Chưa thuộc giai đoạn này: màn thu tiền/công nợ (giai đoạn 4), điểm danh/điểm/tài liệu (giai đoạn 5),
dashboard/báo cáo hoàn chỉnh (giai đoạn 6), hoàn tiền và chuyển khác khóa/chi nhánh.
