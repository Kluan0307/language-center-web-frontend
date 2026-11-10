# Language Center Frontend

**Nghiệm thu lại G17–G18 ngày 10/11/2026:** 12 ca Edge thật đạt cùng backend/MySQL riêng (tổng86ca). [Chạy lại và demo](../language-center-backend/language-center-backend/deployment/acceptance-g17-g18.md). Không coi build/Vitest là thay thế browser acceptance.

Ứng dụng React + TypeScript + Vite, dùng Ant Design và styled-components.
Tổng quan toàn dự án và lộ trình xem [README ngoài cùng](../README.md).

## Chạy

Yêu cầu Node.js tương thích với Vite đang dùng và các backend cần thiết.
Giai đoạn 1–6 cần Auth 8081, Academic 8082, Teaching 8083, Finance 8084 và Gateway 8080.

```powershell
npm install
npm run dev
```

Cấu hình VITE_API_BASE_URL trong .env theo [.env.example](.env.example):
`http://localhost:8080/api/v1`. Khởi động lại Vite sau khi đổi env.

## Hiện trạng

- Đủ 4 role (SUPER_ADMIN, ADMIN, STAFF, TEACHER) và sidebar/route guard dùng cấu hình chung theo chi nhánh.
- Giai đoạn 1 đã nối dữ liệu thật: Chi nhánh, Tài khoản, Nhân viên, Giáo viên và hồ sơ bản thân.
- Giai đoạn 2 đã nối API thật: Khóa, Phòng, Lớp, Lịch; Teacher xem lớp/lịch được phân công.
- Giai đoạn 3 đã nối API thật: Lead, Hồ sơ học viên, Ghi danh, bảo lưu/học lại/chuyển lớp và phục hồi tạo học phí.
- Giai đoạn 4 đã nối API thật: Học phí/công nợ, thu tiền từng đợt, phiếu thu và điều chỉnh học phí theo quyền.
- Giai đoạn 5 đã nối API thật: Điểm danh/lịch sử/chuyên cần, Bài kiểm tra/Bảng điểm/lịch sử sửa và Tài liệu/upload/duyệt/download.
- Giai đoạn 6 đã hoàn thành Dashboard theo role, Báo cáo vận hành/tài chính/đánh giá và CSV; menu mobile và tải trang theo route.
- G02–G12 hoàn thiện: Quản trị hồ sơ & bàn giao giáo viên (G02/G03), Chương trình/điều kiện/đánh giá đầu vào (G04/G05), Gợi ý & ngoại lệ phân lớp (G06/G07), Kế hoạch thời lượng & giờ học thực tế (G08/G09), Quy tắc điểm tạm & kết quả cuối khóa (G10/G11), Hồ sơ học tập tổng hợp & UX luồng chính (G12).
- G13–G15 hoàn thành bộ hồ sơ thiết kế đồ án khóa luận: 18 nhóm Use Case (G13), ERD & Class Diagram 53 bảng/52 entity (G14), 10 sơ đồ Activity & Sequence cho 5 luồng nghiệp vụ cốt lõi (G15). Hệ thống kết nối đồng bộ qua 173 API chính tại Gateway `:8080`.

Chi tiết và kết quả xác minh: [Giai đoạn 1](docs/phase-one.md).
Chi tiết giai đoạn 2: [Khóa, Phòng, Lớp và Lịch](docs/phase-two.md).
Chi tiết giai đoạn 3: [Tuyển sinh, học viên và ghi danh](docs/phase-three.md).
Chi tiết giai đoạn 4: [Học phí, phiếu thu và công nợ](docs/phase-four.md).
Chi tiết giai đoạn 5: [Điểm danh và giảng dạy](docs/phase-five.md).
Chi tiết giai đoạn 6: [Dashboard, báo cáo và hoàn thiện](docs/phase-six.md).
Chạy demo và nghiệm thu: [Acceptance guide](docs/acceptance-guide.md).
Phân quyền sidebar: [Role navigation](docs/role-navigation.md).
Hợp đồng backend: [API contracts](../language-center-backend/language-center-backend/docs/api-contracts.md).

## Cấu trúc

```text
src/api/                 # Axios client qua Gateway
src/services/            # API theo nghiệp vụ
src/types/               # DTO request/response
src/hooks/               # auth và tải dữ liệu
src/context/             # phiên đăng nhập
src/config/              # menu và quyền route
src/components/Common/   # thành phần dùng chung
src/components/Layout/   # Sidebar, LoginForm, ManagementLayout
src/pages/               # mỗi nhóm chức năng một thư mục
src/utils/               # lỗi API, lưu phiên, quyền hành động, hiển thị
tests/                   # Node test runner, không cần cài framework mới
```

## Kiểm tra

```powershell
npm test
npm run build
npm run lint
```

50 test frontend đạt sau giai đoạn 6; TypeScript/build và full ESLint đạt.
Màn Điểm danh cũ đã được thay bằng API thật; không còn lỗi lint đó.

## Cải thiện giai đoạn 1 — Nhiều chi nhánh

SUPER_ADMIN phân công chi nhánh và xem lịch sử tại trang Tài khoản/Giáo viên/Nhân viên. ADMIN/TEACHER dùng bộ chọn chi nhánh ở sidebar/menu di động. ADMIN có chế độ tất cả chi nhánh được giao trên Tổng quan/Báo cáo. Staff tối đa một chi nhánh. Xem [quy tắc và API](../language-center-backend/language-center-backend/docs/improvements/phase-one-multi-branch.md).

## Cải thiện giai đoạn 2 — Tài khoản

Nhấn tên trên sidebar để mở Hồ sơ: sửa liên hệ, đổi mật khẩu và đăng xuất tất cả phiên. Quản lý có nút Cấp lại mật khẩu theo phạm vi quản lý toàn tài khoản. Tài khoản mới/cấp lại được chuyển tới /change-password trước khi vào nghiệp vụ. [API và quy tắc](../language-center-backend/language-center-backend/docs/improvements/phase-two-account-security.md).

## Cải thiện 3 — lịch thực tế

Lịch học mặc định hiển thị từng buổi; Admin/Super Admin có Mẫu sinh lịch, đổi phòng/dạy thay, hủy/khôi phục và học bù. Teacher dashboard lấy buổi thực tế; điểm danh dùng sessionId. [Quy tắc và hướng dẫn](../language-center-backend/language-center-backend/docs/improvements/phase-three-class-sessions.md).

## Cải thiện 4 — vòng đời và dự thi

Trang Học viên có lịch sử vòng đời; Đăng ký có lý do, ngày dự kiến, lịch sử khoảng học và chuyển từ bảo lưu. Bảng điểm lấy roster ngày thi, có chỉ báo chốt và không nhập trước ngày thi. [Hướng dẫn](../language-center-backend/language-center-backend/docs/improvements/phase-four-learning-lifecycle.md).

## Cải thiện 5 — tài chính

Học phí có lịch sử và tiền dư; Phiếu thu có đảo/hoàn và lịch sử; Báo cáo tách thu gốc/đảo/hoàn/thu ròng và đối soát nội bộ. Yêu cầu chờ được giữ theo tài khoản để phục hồi sau timeout/reload. [Hướng dẫn](../language-center-backend/language-center-backend/docs/improvements/phase-five-finance-ledger.md).

## Cải thiện 6

CRM: Staff đọc cùng chi nhánh, chỉ sửa lead được giao; Admin/Super Admin bàn giao người phụ trách. Có lịch hẹn/quá hạn và lịch sử. Teacher gửi lại tài liệu REJECTED của mình; quản lý duyệt version đang xem. Staff chỉ đọc APPROVED hiện tại, không xem revision/history. Form cảnh báo bỏ thay đổi; chưa chặn mọi điều hướng nội bộ. 72 tests, lint/build đạt; đã kiểm tra UI theo bốn role và file cũ/mới. [Chi tiết backend và V006](../language-center-backend/language-center-backend/docs/improvements/phase-six-care-documents-experience.md).

## Build để triển khai (cải thiện 7)

Build với `VITE_API_BASE_URL=/api/v1` để FE và API dùng cùng origin qua reverse proxy. `dist` được đóng gói bởi backend `scripts/package-release.cjs`; không đưa `.env.local` vào release. Xem [runbook triển khai](../language-center-backend/language-center-backend/docs/improvements/phase-seven-deployment.md). Vite dev server không dùng cho production.

## G02–G03: hồ sơ và bàn giao giáo viên

Nút Xem của teacher ở trang quản trị mở profile có sửa/lịch sử, trạng thái làm việc và trách nhiệm; chỉ quản lý đủ toàn bộ phân công được sửa. Bàn giao dùng ClassForm/SessionEditor hiện có, xử lý từng mục rồi tải lại. Form profile/work status có dirty guard; không tự mở/khóa đăng nhập. BE cần V007 và Auth/Academic mới. [Bàn giao](../language-center-backend/language-center-backend/docs/thesis-progress/G03.md).

## G04–G05 — 08/11/2026

- Khóa học: SA mở **Chương trình và trình độ** để quản lý danh mục. Xem khóa → xác minh đầu vào/đầu ra (SA/A theo phạm vi); text cũ chỉ tham khảo.
- Lớp học → Xem → **Đầu vào / đầu ra**: policy snapshot và lịch sử, SA/A áp dụng bản khóa mới có lý do. Sửa khóa không đổi lớp ngầm.
- Học viên → Xem → **Đánh giá đầu vào**: SA/A/S tạo/sửa nháp, xác nhận nguồn, tạo bản thay thế, thu hồi, lọc và xem lịch sử; kết quả hiện hành tách khỏi bảng lịch sử. Teacher không có quyền CRM này.
- Modules: src/components/Common/Placement, services/placementService.ts, types/placement.ts; dùng Ant Design + hooks/layout hiện có, version conflict và dirty guard. Backend cần V008/V009 sau V007. Không dùng text currentLevel làm assessment.

[Hợp đồng backend](../language-center-backend/language-center-backend/docs/api-contracts.md) · [Bàn giao G04](../language-center-backend/language-center-backend/docs/thesis-progress/G04.md) · [G05](../language-center-backend/language-center-backend/docs/thesis-progress/G05.md). Chưa triển khai eligibility/gợi ý ở G06 hoặc ngoại lệ G07.

## G06–G07 — phân lớp và ngoại lệ

Trang **Đăng ký & xếp lớp** có preview điều kiện/assessment, bảng lớp và lý do phù hợp/chặn, đề nghị và hàng đợi ngoại lệ. Staff đề nghị; SA/Admin duyệt/từ chối theo phạm vi; người ghi danh chọn xác nhận hợp lệ để dùng. Chuyển/học lại có cùng kiểm tra, detail đăng ký có lịch sử căn cứ, legacy thiếu snapshot được đánh dấu rõ. Không thêm menu Teacher.

Mất phản hồi lưu: dùng **Kiểm tra đăng ký/kết quả đã lưu**, hoặc mở đề nghị đã sử dụng và đăng ký kết quả trước gửi lại. Cần backend V010 sau V009. [Hợp đồng](../language-center-backend/language-center-backend/docs/api-contracts.md) · [G06](../language-center-backend/language-center-backend/docs/thesis-progress/G06.md) · [G07](../language-center-backend/language-center-backend/docs/thesis-progress/G07.md). Modules: EnrollmentPlacement.tsx, enrollmentPlacementService.ts và form/actions/page hiện có.

## G08–G09 — thời lượng phút

Khóa học tạo mới nhập **Kế hoạch (phút)**, không mặc định duration24. Xem khóa có xác minh thời lượng/lịch sử; Admin chỉ sửa khóa chi nhánh, SA sửa cả khóa chung. Chi tiết lớp → **Thời lượng / tiến độ** có kế hoạch riêng, áp dụng bản khóa hoặc CUSTOM có lý do/version. Teacher/Staff chỉ đọc.

Lịch lớp chọn classId hiển thị tổng toàn lớp, không theo bộ lọc ngày. Từng buổi có giờ/phút; hủy không tính, bù không cộng nguồn, thiếu giờ chưa xác minh không thay bằng0. Giữ readonly lịch sử completed. DurationPanel/durationService/utils-duration và validators-session theo Ant Design/hooks/layout hiện có. [G08](../language-center-backend/language-center-backend/docs/thesis-progress/G08.md), [G09](../language-center-backend/language-center-backend/docs/thesis-progress/G09.md). Backend cần V011, kết quả cuối khóa tiếp ở G10/G11.

## G10 — đánh giá tạm theo quy tắc lớp

Bài kiểm tra → Quy tắc lớp và Bảng điểm → Đánh giá tạm/quy tắc: SA/Admin chọn bài áp dụng/bắt buộc, trọng số, ngưỡng, chuyên cần và xác nhận có version/lý do; Teacher chỉ đọc quy tắc/preview lớp chính. Grade entry/audit giữ quyền cũ. Bảng trọng số của Exam là gợi ý, policy xác nhận là nguồn tính.

Báo cáo hiển thị theo enrollment, điểm0/chưa chấm/không áp dụng, lý do chưa đủ và tỷ lệ trên đăng ký đủ dữ liệu; không mặc định50%, không thaynull bằng0/100%. UI ghi rõ chưa chốt cuối khóa. EvaluationWorkspace.tsx/evaluationService.ts dùng Ant Design/hook/layout hiện có. [G10](../language-center-backend/language-center-backend/docs/thesis-progress/G10.md), [hợp đồng](../language-center-backend/language-center-backend/docs/api-contracts.md). Backend cần V012 và Academiccontext mới.

## Bản thảo và demo sau đối chiếu G15–G19

G19 dùng4role/route và dữ liệu nghiệm thu thực tế; [bản thảo](../language-center-backend/language-center-backend/docs/thesis/report/index.md), [demo](../language-center-backend/language-center-backend/docs/thesis/report/kich-ban-demo.md). Bản nộp còn mẫu khoa/khảo sát và releaseG20 cần xác minh riêng.

G20 đã kiểm tra FEbuild tĩnh cùng JAR trong release, restore và UI4role. [Bàn giao](../language-center-backend/language-center-backend/docs/thesis-progress/G20.md) · [Mở demo](../language-center-backend/language-center-backend/deployment/defense-rehearsal-checklist.md). Không dùng Vite để thay nghiệm thu artifact.
