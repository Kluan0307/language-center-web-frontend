# Giai đoạn 5 — Điểm danh và giảng dạy

Hoàn thành ngày 04/11/2026. Giao diện React/TypeScript + Ant Design, dùng ManagementLayout và styled-components theo cấu trúc dự án.
Điểm danh dùng Academic; bài kiểm tra, điểm và tài liệu dùng Teaching qua Gateway.

## Các màn đã nối API thật

| Màn hình | Chức năng |
|---|---|
| /attendance | Chọn lớp/ngày, tải danh sách có hiệu lực, có mặt/vắng/đi muộn/có phép, lưu cả buổi, lịch sử theo khoảng ngày và tổng hợp chuyên cần |
| /exams | Danh sách phân trang theo lớp/chi nhánh; tạo/sửa/xóa bài chưa có điểm; ngày, loại kiểm tra, điểm tối đa và trọng số |
| /grades | Chọn lớp/bài kiểm tra; học viên hiện tại và điểm lịch sử; nhập/cập nhật điểm; nhận xét; lịch sử thay đổi; quản lý hiệu chỉnh kèm lý do và đánh giá lớp |
| /documents | Danh sách phân trang, lọc lớp/khóa/trạng thái/chi nhánh; chi tiết, upload multipart, theo dõi duyệt, duyệt/từ chối và download file có JWT |
| Chi tiết lớp | Liên kết sang điểm danh, bài kiểm tra, bảng điểm và tài liệu theo quyền |

Đã bỏ màn điểm danh mock và placeholder Teacher. Lớp của tôi/lịch dạy tiếp tục dùng API thật từ giai đoạn 2.

## Phân quyền

- Teacher: lớp được phân công; nhập điểm cho học viên đang học; xem/sửa điểm trong quyền hiện tại;
  upload theo lớp hoặc khóa được phân công; chỉ xem/tải tài liệu do chính mình đăng.
- Admin/Super Admin: quản lý bài kiểm tra; chỉ hiệu chỉnh điểm đã có, bắt buộc lý do;
  xem đánh giá lớp; upload và duyệt/từ chối tài liệu. Super Admin có bộ lọc chi nhánh.
- Staff: điểm danh trong chi nhánh; xem/tải tài liệu APPROVED. Không truy cập bài kiểm tra,
  bảng điểm hoặc đánh giá; không upload hay duyệt.
- Backend xác minh quyền/chi nhánh/lớp; frontend không dùng danh sách mock để suy ra quyền.

## Điểm danh và lịch sử

Sheet lấy từ API theo classId và date, không tự ghép roster hiện tại.
Dùng enrollmentId, không dùng studentId làm khóa dòng. Danh sách đã lưu vẫn chứa học viên
đã chuyển/bảo lưu khi lịch sử buổi học có dữ liệu của họ.

Các dòng chưa ghi nhận mặc định Có mặt để nhập nhanh và được đánh dấu Chưa lưu.
Chỉ lưu khi người dùng xác nhận; không tự tính chuyên cần trước đó.
Vắng có thể Có phép; đổi sang Có mặt/Đi muộn tự bỏ Có phép.
Lưu toàn bộ roster. Nếu có đăng ký thay đổi đồng thời, server từ chối danh sách thiếu và yêu cầu tải lại.
Không tạo buổi tương lai hoặc buổi ngoài lịch hợp lệ. Buổi cũ đã lưu vẫn xem được khi lịch thay đổi.

Tổng hợp tách theo đăng ký, chỉ tính các buổi đã ghi nhận.
Tỷ lệ tham gia = (Có mặt + Đi muộn) / tổng buổi đã ghi nhận.
Buổi chưa điểm danh không tự coi là vắng. Không gộp lịch sử nhiều đăng ký thành một dòng học viên.

## Bài kiểm tra và điểm

- Trọng số là tương đối (0 < weight <= 100), không ép tổng bằng 100.
- Điểm tối đa dương, tối đa 10000; điểm nhập từ 0 đến maxScore, tối đa hai chữ số thập phân.
  Điểm 0 là đã nhập; để trống là chưa nhập.
- Không chuyển bài sang lớp khác. Đã có điểm thì không đổi weight/maxScore và không xóa bài.
- Teacher chỉ nhập/cập nhật cho học viên đang học trong lớp hiện được phân công.
  Học viên rời lớp vẫn có điểm lịch sử nhưng Teacher không còn nút cập nhật cho họ.
- Admin/Super Admin chỉ sửa điểm đã có và ghi lý do; không nhập điểm đầu tiên thay Teacher.
  Người nhập ban đầu được giữ; mọi cập nhật có lịch sử điểm cũ/mới, người sửa, thời gian và lý do.
- Đánh giá dành cho quản lý: chuẩn hóa từng bài theo maxScore, tính trung bình trọng số
  trên các bài đã có điểm; đạt từ 50%. Chỉ tính học viên có điểm, không tự thay điểm thiếu bằng 0.
- Ngày kiểm tra dùng trường ngày của API; phiên bản hiện tại chưa kiểm tra ngày này theo
  thời gian học/roster tại ngày thi. Quyền nhập dựa trên đăng ký đang học lúc nhập điểm,
  không phải roster lịch sử tại ngày thi. Đây là giới hạn hiện có của backend.

## Tài liệu

- Chọn đúng một lớp hoặc một khóa; Teacher chỉ thấy các lựa chọn được phân công.
- File > 0, <= 10 MB; PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, PNG/JPG/JPEG, TXT.
- Upload dùng FormData, không ép Content-Type JSON. File được lưu bằng khóa riêng ở backend;
  không tạo đường dẫn public để bỏ qua phân quyền.
- Tài liệu mới PENDING. Quản lý chọn APPROVED hoặc REJECTED; từ chối cần lý do.
  Duyệt có khóa giao dịch, hai người duyệt đồng thời chỉ một người thành công.
  Kết quả ghi người duyệt/thời gian/lý do. Đã duyệt không có chức năng duyệt lại.
- Download dùng API có JWT rồi tạo Blob URL tạm để tải file, sau đó giải phóng URL.
- Nếu upload mất phản hồi, giao diện yêu cầu kiểm tra danh sách trước khi gửi lại;
  API upload hiện chưa có khóa idempotency nên không tự retry POST.
- Chưa có sửa/xóa/thay thế file dưới cùng một tài liệu hoặc quy trình gửi lại bản bị từ chối.
  Có thể upload bản mới và duyệt như tài liệu mới.

## Chạy

Cần Auth 8081, Academic 8082, Teaching 8083, Gateway 8080 và frontend 5173.
Finance 8084 cần cho tạo học phí khi ghi danh; không phải phụ thuộc trực tiếp của việc nhập điểm/upload.

Trong thư mục academic-service và teaching-service, chạy mvn spring-boot:run.
Khởi động lại nếu service đang chạy bằng mã cũ.
Teaching đọc .env.local chung và DOCUMENT_STORAGE nếu có; mặc định lưu ./storage/documents
tính từ thư mục chạy teaching-service. Giữ thư mục này khi sao lưu/triển khai, không chỉ sao lưu database.

Luồng Teacher: Lớp của tôi → Điểm danh → Bài kiểm tra → Bảng điểm → Tài liệu của tôi.
Luồng quản lý: hiệu chỉnh điểm kèm lý do → đánh giá lớp → duyệt tài liệu.
Staff kiểm tra được điểm danh và tải file sau khi tài liệu được duyệt.

## Xác minh

- 44 test frontend đạt; TypeScript và production build đạt.
- Full ESLint đạt; lỗi set-state-in-effect của màn điểm danh cũ đã được loại bỏ khi thay màn.
- Academic: 12 test; Teaching: 8 test, tất cả đạt trên H2/mock/HTTP stub.
  Có thêm kiểm thử hai reviewer đồng thời.
- 37 kiểm tra Edge/API trên MySQL: lưu/reload/history điểm danh, ngày tương lai, roster sau chuyển lớp,
  nhập điểm 0/cập nhật/phúc khảo/lịch sử/thang điểm, đánh giá, quyền Staff/Teacher,
  upload multipart, download đúng byte, từ chối có lý do, khóa học được phân công và hai reviewer cạnh tranh.
- Các fixture được theo dõi theo ID, dọn cả database và file. Instance kiểm thử dùng cổng riêng
  và kho file riêng; các service người dùng đang chạy được giữ nguyên.

Giai đoạn 6 tiếp theo: Dashboard từng role, báo cáo, hoàn thiện giao diện và nghiệm thu tổng thể.
