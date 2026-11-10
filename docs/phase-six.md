# Giai đoạn 6 — Dashboard, báo cáo và hoàn thiện MVP

Hoàn thành ngày 04/11/2026. Các mục điều hướng hiện tại đã có màn nghiệp vụ dùng API thật.
Giữ React/TypeScript + Ant Design + styled-components theo cấu trúc hiện có.

## Dashboard theo role

| Role | Nội dung và nguồn dữ liệu |
|---|---|
| Super Admin | Thống kê vận hành toàn hệ thống/chi nhánh; tiền thu tháng hiện tại và công nợ; chọn chi nhánh và mở báo cáo tương ứng |
| Admin | Học viên/lớp/Lead, tỷ lệ lấp đầy/chuyển đổi, khoản quá hạn; tiền thu tháng hiện tại và công nợ của chi nhánh |
| Staff | Số liệu vận hành và số khoản học phí quá hạn; không gọi Finance Stats hoặc hiển thị doanh thu quản lý |
| Teacher | Lớp được phân công, lớp đang diễn ra, lượt học viên, buổi theo lịch hôm nay và lịch dạy 7 ngày; không gọi API thống kê quản lý |

Dashboard Teacher tải đủ trang lớp và lịch được phân quyền, ghép lịch tuần với ngày bắt đầu/kết thúc lớp.
Loại lớp FINISHED khỏi lịch; bao gồm hôm nay đến hết ngày thứ 7. “Buổi hôm nay” bao gồm cả buổi đã qua giờ.
Lượt học viên là cộng sĩ số lớp chưa kết thúc, không phải số cá nhân duy nhất.
Chưa có lịch nghỉ/đổi buổi riêng trong API nên không tự suy diễn ngày nghỉ.

Nguồn vận hành: /academic/stats/overview. Khoản quá hạn: totalElements của API /finance/tuitions?overdue=true.
Nguồn tiền thu/công nợ quản lý: /finance/stats/overview.
Khi một nguồn lỗi, phần độc lập còn lại vẫn hiển thị; chỉ số chưa tải hiện “—”, không giả thành 0.
Có nút tải lại và đường tiếp tục xử lý yêu cầu thu tiền đang chờ.

## Báo cáo quản lý

Route /reports dành cho Admin/Super Admin, gồm:

1. **Vận hành:** học viên theo trạng thái/trình độ; lớp theo tiến độ; Lead theo trạng thái;
   học viên mới trong tháng; lấp đầy/chuyển đổi. Super Admin có bảng so sánh chi nhánh.
2. **Tài chính:** tiền đã thu trong khoảng ngày, công nợ hiện tại; phân tích tháng/khóa gốc/chi nhánh.
   Bộ lọc ngày tính cả hai ngày đầu/cuối, kiểm tra từ ngày không sau đến ngày.
3. **Đánh giá lớp:** số bài đã chấm, điểm trung bình chuẩn hóa và tỷ lệ đạt từ Teaching,
   giữ quy tắc chỉ tính học viên/bài đã có điểm từ giai đoạn 5.

Chuyển đổi Lead = số CONVERTED / tổng Lead. Lấp đầy = tổng sĩ số / tổng sức chứa các lớp chưa kết thúc.
Tỷ lệ toàn hệ thống tính từ tử/mẫu chung, không lấy trung bình phần trăm các chi nhánh.

Khoảng ngày **chỉ lọc phiếu thu PAID**. Công nợ là số dư hiện tại của học phí chưa hủy,
không phải số dư lịch sử tại cuối kỳ. Thống kê vận hành cũng là hiện trạng, không chịu bộ lọc ngày tài chính.
Tiền thu được nhóm theo khóa ghi danh gốc; chuyển lớp cùng khóa không đổi khóa tính thu.
Khóa/chi nhánh được đối chiếu tên từ danh mục, có mã ID dự phòng khi không tải được tên.

Backend đã chuẩn hóa nhóm tháng thành YYYY-MM và sắp theo thời gian, tránh thứ tự 1,10,2.
Biểu đồ chỉ hiển thị các tháng có khoản thu.

## CSV, responsive và tải trang

- Xuất CSV vận hành/tài chính từ đúng dữ liệu báo cáo đã tải và phạm vi đang chọn.
  CSV có nhãn kỳ thu, công nợ hiện tại, UTF-8 BOM và escape dấu nháy/xuống dòng.
  Ô bắt đầu bằng ký tự công thức spreadsheet được chuyển thành văn bản.
- Desktop giữ sidebar; <= 900px dùng menu Drawer. Menu đóng sau khi chọn route.
  Đã kiểm tra 390px, 768px, 1366px và 1600px. Bảng rộng cuộn trong bảng.
- Các trang nghiệp vụ tải theo route bằng React.lazy/Suspense; có trạng thái đang tải trang.
  Build tách entry khoảng 233 kB (gzip 80 kB), thay vì một bundle nghiệp vụ khoảng 1,7 MB.
  Đây không phải tổng dung lượng tải; chunk dùng chung Sidebar/Ant Design còn khoảng 727 kB và Vite vẫn cảnh báo kích thước.
- Tiền/số liệu hiển thị theo định dạng tiếng Việt; lỗi, rỗng và chưa tải được phân biệt.

## Xác minh giai đoạn 6

- **50 test frontend đạt**, TypeScript/production build và full ESLint đạt.
- Chạy lại **toàn bộ 43 test backend**, không lỗi/skips:
  Auth 10, Academic 12, Finance 10, Teaching 8, Gateway 3.
- Hai test Finance mới kiểm tra thứ tự tháng, ngày cuối bao gồm 23:59:59,
  số dư hiện tại độc lập kỳ thu và chặn Staff.
- **30 kiểm tra Edge/API/MySQL**: đối chiếu Dashboard 4 role; quyền thống kê;
  nhóm chi nhánh và tỷ lệ có trọng số; ngày thu, tháng, công nợ; phục hồi lỗi Finance;
  CSV tải thật; báo cáo đánh giá; menu mobile/tablet/desktop; chặn URL báo cáo Staff/Teacher.
- Đã chạy luồng xuyên service bằng fixture: Lead → Student → Enrollment → Tuition →
  Payment → Attendance → Grade → Document upload/approval → Staff download.
- Fixture được theo dõi bằng ID, dọn cả database/file; các instance kiểm thử tách cổng
  và được dừng. Không dừng các service người dùng đang chạy, không reset database.

## Chạy demo và giới hạn còn lại

Xem [hướng dẫn nghiệm thu](acceptance-guide.md). Cần Auth 8081, Academic 8082,
Teaching 8083, Finance 8084, Gateway 8080 và frontend localhost:5173.
Khởi động lại Finance để nhận chuẩn hóa nhóm tháng; tải lại frontend để nhận Dashboard/báo cáo.

Sáu giai đoạn MVP đã triển khai; vẫn cần người dùng nghiệm thu quy tắc và giao diện thực tế.
Không coi đây là xác nhận đã triển khai production hoặc kiểm thử tải/bảo mật toàn diện.
Chưa triển khai: portal học viên, VNPay/đối soát ngân hàng, hoàn tiền, chuyển khác khóa/chi nhánh,
đổi/quên mật khẩu, sửa hồ sơ tài khoản, phân công lại Lead, roster lịch sử theo ngày thi,
ngày nghỉ/đổi buổi, gửi lại tài liệu bị từ chối, lịch sử toàn bộ điều chỉnh học phí.
Chi tiết giới hạn từng nghiệp vụ tiếp tục giữ trong tài liệu các giai đoạn trước.
