# Giai đoạn 4 — Học phí, phiếu thu và công nợ

Hoàn thành ngày 04/11/2026. React/TypeScript + Ant Design, dùng ManagementLayout và styled-components theo cấu trúc hiện có.

## Màn hình và quyền

| Màn hình | Đã triển khai |
|---|---|
| /tuition | Danh sách/chi tiết học phí, tìm học viên/lớp/khóa; lọc lớp gốc, trạng thái, quá hạn, chi nhánh; phân trang; tiền ban đầu, giảm trừ, phải thu, đã thu và còn nợ |
| /payments | Danh sách/chi tiết phiếu thu; tìm số phiếu/mã giao dịch; lọc học phí/chi nhánh; phân trang; số tiền, phương thức, thời gian, người thu và ghi chú |
| Thu tiền | Mở từ học phí hoặc chọn khoản còn nợ trên màn Phiếu thu; tải số dư mới nhất; tiền mặt/chuyển khoản; đóng một phần hoặc toàn bộ |
| Điều chỉnh | Super Admin/Admin thay học phí ban đầu, giảm trừ, hạn đóng và lý do; hiển thị người/thời gian/lý do điều chỉnh gần nhất |

Super Admin có bộ lọc chi nhánh. Admin/Staff chỉ thao tác dữ liệu chi nhánh của tài khoản.
Staff xem học phí, thu tiền và xem phiếu thu, không điều chỉnh giá. Teacher bị chặn cả route lẫn API.
Màn ghi danh có liên kết sang học phí của học viên khi đã tạo học phí thành công.

## Quy tắc tiền và công nợ

- amount = originalAmount - discountAmount; balance = amount - paidAmount.
- Chưa đóng, đóng một phần và đóng đủ phản ánh tiền đã thu. Quá hạn là cờ riêng;
  một khoản đóng một phần vẫn có thể quá hạn. Đóng đủ thì không còn quá hạn.
- Học phí sau giảm trừ không được âm hoặc thấp hơn tiền đã thu.
- Chỉ thu số tiền dương, tối đa hai chữ số thập phân và không vượt số còn nợ.
  Backend khóa Tuition và tính tổng phiếu PAID trong transaction để chống thu vượt đồng thời.
- Thu tiền không đổi trạng thái học hay sĩ số. Bảo lưu/ngừng học không tự hủy công nợ/hoàn tiền.
- Học phí và phiếu thu vẫn thuộc lớp ghi danh gốc sau chuyển lớp cùng khóa.
- Chuyển khoản là xác nhận thủ công đã nhận tiền, chưa có tích hợp đối soát ngân hàng/VNPay.
- Phiếu thu không có chức năng sửa/xóa. Điều chỉnh hiển thị lần gần nhất; backend chưa có bảng lịch sử mọi lần điều chỉnh.
- Không tính tổng công nợ bằng cách cộng riêng trang dữ liệu đang xem. Dashboard/báo cáo tổng hợp thuộc giai đoạn 6.

## Thu tiền khi mất phản hồi

Trước POST, frontend lưu một yêu cầu cố định trong localStorage theo accountId, gồm toàn bộ nội dung
và requestKey. Khi đã lưu yêu cầu, không thay số tiền/phương thức/tham chiếu/ghi chú dưới key đó.

Nếu mất mạng, timeout hoặc lỗi máy chủ chưa biết kết quả:
1. Giữ nguyên yêu cầu; có thể đóng cửa sổ để xử lý sau.
2. Tải lại trang vẫn có cảnh báo yêu cầu đang chờ.
3. Mở yêu cầu và bấm Xác nhận lại yêu cầu. Gửi đúng payload/key cũ.
4. Nếu đã commit, backend trả phiếu thu cũ, kể cả khi học phí đã đóng đủ.
5. Chỉ xóa yêu cầu sau khi nhận kết quả thành công. GET làm mới danh sách/chi tiết chạy riêng,
   không biến một POST thành công thành thao tác thu mới.

Nếu máy chủ từ chối chắc chắn với lỗi nghiệp vụ/quyền/không tìm thấy, giao diện cho hủy yêu cầu
bị từ chối để nhập lại. Trường hợp key đã được dùng cho nội dung khác vẫn giữ yêu cầu để đối chiếu.
Trong khi đang chờ, nút thu mới đưa về yêu cầu cũ. Không xóa dữ liệu trình duyệt khi còn yêu cầu chưa xác nhận.
Dữ liệu localStorage giữ được qua reload/logout trong cùng browser origin; không phải cơ chế khôi phục trên thiết bị khác.

## Chạy

Cần Auth 8081, Academic 8082, Finance 8084, Gateway 8080 và frontend 5173.
Trong từng thư mục service, dùng mvn spring-boot:run. Giữ cấu hình .env.local hiện tại.
Nếu Finance đang chạy từ trước khi cập nhật mã, khởi động lại để nhận DTO audit và kiểm tra nội dung retry mới.

Frontend .env: VITE_API_BASE_URL=http://localhost:8080/api/v1. Chạy npm run dev.
Không cần tạo lại database hoặc xóa dữ liệu cho giai đoạn này.

Luồng thử: ghi danh → xem học phí → Staff thu đợt 1 → Admin điều chỉnh kèm lý do →
Staff thu phần còn lại → xem các phiếu thu, số dư 0 và trạng thái đóng đủ.

## Kiểm tra đã thực hiện

- 37 test frontend đạt (6 test mới về quyền, số tiền, giảm trừ, lưu yêu cầu, giữ payload và retry).
- TypeScript/production build đạt; lint các file triển khai đạt.
- Finance: 8 test đạt trên H2, gồm thu từng đợt, retry, nội dung key bất biến, điều chỉnh/audit
  và hai nhân viên cùng tranh số dư.
- 22 kiểm tra trình duyệt Edge/API trên MySQL thật: thu tiền mặt/chuyển khoản, sửa học phí,
  giữ audit, chặn Staff điều chỉnh, chặn Teacher, chọn khoản thu mới, số dư đổi sau khi mở form,
  quá mức thu, phân quyền khác chi nhánh và bộ lọc Super Admin.
- Đã cố ý chặn response sau khi POST commit rồi reload: xác nhận lại tạo đúng một phiếu cho yêu cầu đó.
- Dữ liệu fixture được theo dõi bằng ID và dọn sau kiểm thử; các instance kiểm thử dùng cổng riêng
  và được dừng. Các service đang chạy của người dùng được giữ nguyên.

Full lint còn lỗi có sẵn tại AttendanceManagement/AttendancePage.tsx (set-state-in-effect).
Màn Điểm danh chưa nối API thật, sẽ xử lý trong giai đoạn 5.
Giai đoạn 5 tiếp theo: điểm danh, bài kiểm tra, điểm, tài liệu và quyền Teacher theo lớp.
