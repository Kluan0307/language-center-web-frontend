import axios from 'axios';
import type { FormInstance } from 'antd';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return error.code === 'ECONNABORTED'
      ? 'Yêu cầu quá thời gian chờ. Hãy tải lại dữ liệu để kiểm tra kết quả trước khi thử lại.'
      : 'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
    if (error.response.status === 401 && error.config?.url === '/auth/login') return 'Sai tên đăng nhập hoặc mật khẩu.';
    if (error.response.status >= 500) return 'Dịch vụ đang gặp sự cố. Vui lòng thử lại sau.';
    const body: unknown = error.response.data;
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      const messages: Record<string, string> = {
        'Payment exceeds outstanding balance': 'Số tiền thu vượt số còn nợ. Hãy tải lại học phí trước khi nhập khoản thu mới.',
        'Tuition is cancelled': 'Khoản học phí đã bị hủy, không thể thu tiền.',
        'Cancelled tuition': 'Không thể điều chỉnh học phí đã bị hủy.',
        'Adjusted tuition cannot be below collected amount': 'Số phải thu sau điều chỉnh không được thấp hơn số tiền đã thu.',
        'requestKey was used for a different payment': 'Yêu cầu này đã được dùng cho một khoản thu khác. Vui lòng kiểm tra phiếu thu trước khi tiếp tục.',
        'Use CASH or BANK_TRANSFER': 'Chỉ hỗ trợ tiền mặt hoặc chuyển khoản.',
        'Teacher must select a class': 'Chọn lớp được phân công trước khi xem bài kiểm tra.',
        'Date is not a scheduled class session': 'Ngày được chọn không phải buổi học theo lịch của lớp.',
        'Cannot change scoring rules after grades exist': 'Không thể đổi trọng số hoặc thang điểm khi đã có điểm.',
        'Cannot move an exam to another class': 'Không thể chuyển bài kiểm tra sang lớp khác.',
        'Exam has grades': 'Không thể xóa bài kiểm tra đã có điểm.',
        'Student is not studying in this class': 'Học viên không còn đang học trong lớp này.',
        'Score must be between 0 and maxScore': 'Điểm phải nằm trong thang điểm của bài kiểm tra.',
        'Administrative correction requires a reason': 'Hiệu chỉnh điểm cần có lý do.',
        'Document has already been reviewed': 'Tài liệu đã được duyệt. Hãy tải lại kết quả mới nhất.',
        'Rejection requires a reason': 'Cần nhập lý do từ chối tài liệu.',
        'File must be between 1 byte and 10 MB': 'File phải lớn hơn 0 và không quá 10 MB.',
        'Unsupported file type': 'Định dạng file không được hỗ trợ.',
        'Document storage unavailable': 'Kho tài liệu đang gặp sự cố. Hãy thử lại sau.',
        'Branch is inactive': 'Chi nhánh đang ngừng hoạt động. Vui lòng liên hệ Super Admin.',
        'Room is under maintenance': 'Phòng đang bảo trì. Vui lòng chọn phòng khác.',
        'Teacher is inactive': 'Giáo viên không còn khả dụng. Vui lòng phân công giáo viên đang hoạt động.',
        'Cannot change course after enrollment': 'Không thể đổi khóa học khi lớp đã có đăng ký.',
        'Only one session per class/day is supported': 'Mỗi lớp chỉ có một buổi trong cùng một ngày trong tuần.',
      };
      return messages[body.message] ?? body.message;
    }
    const status = error.response.status;
    if (status === 400 && body && typeof body === 'object') {
      const first = Object.values(body).find((value) => typeof value === 'string');
      if (first) return String(first);
    }
    if (status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
    if (status === 409) return 'Dữ liệu trùng hoặc đã thay đổi. Vui lòng kiểm tra lại.';
    if (status >= 500) return 'Dịch vụ đang gặp sự cố. Vui lòng thử lại sau.';
  }
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác. Vui lòng thử lại.';
}
export function applyFormErrors(form: FormInstance, error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) return;
  const data: unknown = error.response.data;
  if (!data || typeof data !== 'object') return;
  form.setFields(Object.entries(data).filter(([key, value]) =>
    key !== 'message' && typeof value === 'string').map(([name, value]) => ({
      name, errors: [String(value)],
    })));
}
export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
