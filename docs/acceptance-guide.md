# Hướng dẫn chạy và nghiệm thu MVP

Tổng quan: [README dự án](../../README.md). Chức năng và quy tắc: [Giai đoạn 6](phase-six.md).

## 1. Khởi động

Không cần tạo lại database hay xóa dữ liệu. Các service dùng .env.local hiện tại tại:
language-center-backend/language-center-backend/.env.local.

Mở một terminal cho từng service, cd vào đúng thư mục service và chạy mvn spring-boot:run.
Chỉ chạy một instance cho mỗi cổng. Nếu cổng bị chiếm, kiểm tra instance đang chạy trước khi mở thêm.

| Thư mục service | Cổng |
|---|---:|
| auth-service | 8081 |
| academic-service | 8082 |
| teaching-service | 8083 |
| finance-service | 8084 |
| api-gateway | 8080 |

Ví dụ từ thư mục backend ngoài cùng có pom.xml và các thư mục service:

```powershell
cd .\finance-service
mvn spring-boot:run
```

Auth/Academic cần sẵn sàng trước khi đăng nhập/ghi danh. Finance/Teaching cần Academic.
Gateway trỏ về các cổng trên. Đợi log Started của từng service.

Frontend:

```powershell
cd D:\hoctap\KLTN\language-center\language-center-web-frontend
npm install
npm run dev
```

.env frontend dùng VITE_API_BASE_URL=http://localhost:8080/api/v1.
Mở http://localhost:5173. Sau khi đổi env, khởi động lại Vite.
CORS hiện phục vụ localhost:5173; không giả định dist/preview hoặc domain khác được cho phép sẵn.
Teaching lưu file theo DOCUMENT_STORAGE hoặc ./storage/documents trong thư mục chạy service.
Cần sao lưu kho file cùng database; sao lưu SQL không chứa nội dung file.

## 2. Dữ liệu demo do người dùng tạo

Các tài khoản superadmin/admin/staff/teacher đã có trong database phát triển.
Dùng mật khẩu đã được thiết lập cho chúng. Admin/Staff/Teacher đang cùng chi nhánh ban đầu.
Không có cơ chế tự reset hoặc tự nạp dữ liệu demo khi mở Dashboard.

1. Admin tạo khóa “IELTS cơ bản”: 24 buổi, học phí 3.000.000, tối đa 20 học viên.
2. Tạo phòng A101 sức chứa 20.
3. Tạo lớp IELTS-K01, chọn khóa/phòng/Teacher; bắt đầu hôm nay, kết thúc sau một tháng.
4. Xếp một buổi trong đúng thứ hôm nay, ví dụ 18:00–19:30.
5. Staff tạo Lead “Học viên demo”, chăm sóc sang Đã liên hệ rồi chuyển thành học viên.
6. Bổ sung hồ sơ; ghi danh vào IELTS-K01. Kiểm tra học phí đã được tạo.
7. Staff thu đợt 1: 1.000.000 tiền mặt.
8. Admin giảm trừ 200.000 kèm lý do: số phải thu 2.800.000, còn nợ 1.800.000.
9. Staff thu đợt 2: 1.800.000 chuyển khoản; kiểm tra hai phiếu thu và số dư 0.
10. Teacher điểm danh buổi hôm nay; tạo bài kiểm tra thang 10, trọng số 1 và nhập điểm 8.
11. Teacher tải một file TXT/PDF nhỏ; Admin duyệt; Staff tải lại được đúng file.
12. Mở Dashboard/báo cáo. Tiền thu trong kỳ chứa cả hai phiếu là 2.800.000;
    lớp có một lượt học viên; học viên đã chấm đạt 80% và tỷ lệ đạt là 100% khi chỉ có một người.
    Nếu database có dữ liệu khác, đối chiếu phần tăng thêm thay vì kỳ vọng tổng toàn hệ thống bằng mẫu này.

## 3. Nghiệm thu theo role

| Role | Điều cần xác nhận |
|---|---|
| Super Admin | Chọn toàn hệ thống/từng chi nhánh; bảng chi nhánh và tổng cộng khớp dữ liệu gốc |
| Admin | Chỉ dữ liệu chi nhánh; điều chỉnh phí có lý do; sửa điểm đã có; duyệt tài liệu |
| Staff | Chăm sóc/ghi danh/thu tiền/điểm danh; không sửa giá, không truy cập bài kiểm tra/điểm/báo cáo quản lý |
| Teacher | Chỉ lớp được phân công; điểm danh/nhập điểm; tài liệu của mình; không truy cập tuyển sinh/tài chính |

Kiểm tra cả nhập URL trực tiếp, không chỉ nút trên sidebar.
Màn nhỏ mở Menu, chọn chức năng và kiểm tra menu tự đóng; bảng rộng có thể cuộn ngang.
Thử reload sau khi lưu để xác nhận dữ liệu từ server.

## 4. Tình huống lỗi quan trọng

- Finance chưa chạy khi ghi danh: giữ đăng ký, chạy Finance rồi thử tạo học phí; không ghi danh lại.
- Thu tiền mất phản hồi: mở yêu cầu đang chờ và xác nhận lại đúng yêu cầu; không tạo khoản thu mới.
- Hai người thu cùng số dư: một yêu cầu bị từ chối nếu vượt phần còn lại.
- Bảo lưu/chuyển lớp: kiểm tra sĩ số, giữ học phí gốc và lịch sử điểm danh.
- Học viên rời lớp: điểm cũ vẫn thấy; Teacher không sửa tiếp, quản lý hiệu chỉnh theo quyền.
- File chưa duyệt/từ chối: Staff không đọc hoặc tải qua URL trực tiếp.
- Finance Stats lỗi: Dashboard vận hành vẫn hiển thị, tài chính hiện chưa tải; có thể thử lại.
- Báo cáo kỳ cũ: công nợ vẫn là hiện tại, không gọi đó là công nợ tại cuối kỳ.
- Đổi từ ngày sau đến ngày: không gọi báo cáo hoặc xuất CSV với khoảng không hợp lệ.

## 5. Kiểm tra mã và kết quả hiện tại

Tại backend root:

```powershell
mvn test
```

Test Java dùng H2/mock, không dùng database MySQL phát triển. Nếu máy có cache Maven riêng,
dùng đúng thiết lập local repository của máy.

Tại frontend:

```powershell
npm test
npm run build
npm run lint
```

Kết quả ngày 04/11/2026: 43 test backend, 50 test frontend đạt; build và lint đạt.
Đã kiểm tra các luồng trên MySQL/trình duyệt bằng fixture riêng, sau đó dọn sạch fixture.
Người dùng vẫn cần duyệt giao diện, quy tắc nghiệp vụ và dữ liệu demo của mình trước nghiệm thu cuối.

## 6. Sau MVP

Hoàn thiện theo phản hồi nghiệm thu trước khi mở thêm chức năng.
Triển khai production cần cấu hình domain/CORS, vận hành các service, database và kho file theo môi trường thực tế.
Chưa có thực hiện deploy, HTTPS, backup tự động, kiểm thử tải hoặc kiểm toán bảo mật trong đợt này.

## Nghiệm thu cải thiện 4

Xem [vòng đời học viên và roster thi](../../language-center-backend/language-center-backend/docs/improvements/phase-four-learning-lifecycle.md): thử Staff bảo lưu/cập nhật ngày/học lại/chuyển lớp, lịch sử hồ sơ; Teacher nhập điểm kỳ thi cũ cho người đã bảo lưu; kiểm tra chốt roster và từ chối học viên vào sau ngày thi. Các API trạng thái/chuyển lớp dùng reason + version.

## Nghiệm thu cải thiện 5

[Hướng dẫn tài chính](../../language-center-backend/language-center-backend/docs/improvements/phase-five-finance-ledger.md): thu một phần/đủ; giảm phí tạo tiền dư; Admin hoàn/đảo có lý do; Staff không có nút quản lý; xem audit và đối soát. Khi giả lập mất phản hồi sau commit, giữ payload, reload và mở yêu cầu cũ — không tạo key mới. Kiểm tra báo cáo giữ thu gốc ở kỳ gốc, hoàn/đảo ở ngày xử lý.

## Cải thiện 6

CRM: Staff đọc cùng chi nhánh, chỉ sửa lead được giao; Admin/Super Admin bàn giao người phụ trách. Có lịch hẹn/quá hạn và lịch sử. Teacher gửi lại tài liệu REJECTED của mình; quản lý duyệt version đang xem. Staff chỉ đọc APPROVED hiện tại, không xem revision/history. Form cảnh báo bỏ thay đổi; chưa chặn mọi điều hướng nội bộ. 72 tests, lint/build đạt; đã kiểm tra UI theo bốn role và file cũ/mới. [Chi tiết backend và V006](../../language-center-backend/language-center-backend/docs/improvements/phase-six-care-documents-experience.md).
