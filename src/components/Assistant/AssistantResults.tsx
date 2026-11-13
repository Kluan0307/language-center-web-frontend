import { Fragment } from 'react';
import { Button } from 'antd';
import { ArrowUpRight } from 'lucide-react';
import type { AssistantCard } from '../../types/assistant';
import { assistantRows, object } from '../../utils/assistant';
import * as S from './Assistant.styles';

const labels: Record<string, string> = {
  value: 'Số lượng', level: 'Trình độ', type: 'Chương trình', tuitionFee: 'Học phí', expectedMinutes: 'Thời lượng (phút)',
  teacherName: 'Giáo viên', currentSize: 'Sĩ số', maxSize: 'Sức chứa', startDate: 'Bắt đầu', endDate: 'Kết thúc',
  classCode: 'Mã lớp', className: 'Lớp', courseName: 'Khóa học', studentName: 'Học viên', sessionDate: 'Ngày học',
  startTime: 'Giờ bắt đầu', endTime: 'Giờ kết thúc', roomName: 'Phòng', kind: 'Loại buổi', substitute: 'Dạy thay',
  status: 'Trạng thái', studyStatus: 'Học tập', relationship: 'Quan hệ lớp', state: 'Ghi nhận', recorded: 'Đã ghi nhận',
  score: 'Điểm', maxScore: 'Thang điểm', examDate: 'Ngày kiểm tra', view: 'Loại điểm', rosterState: 'Danh sách dự thi', publishedAt: 'Công bố lúc',
  amount: 'Số tiền', paidAmount: 'Đã đóng', balance: 'Còn nợ', credit: 'Dư', dueDate: 'Hạn đóng', overdue: 'Quá hạn',
  receiptNo: 'Số phiếu', voidedAmount: 'Đã hủy', refundedAmount: 'Đã hoàn', availableAmount: 'Còn hiệu lực', paidAt: 'Ngày thu',
  nextContactAt: 'Hẹn liên hệ', assignedToName: 'Người phụ trách', priorityReason: 'Lý do ưu tiên', text: 'Hướng dẫn',
};
const terms: Record<string, string> = {
  OPEN: 'Đang mở', CLOSED: 'Đã đóng', UPCOMING: 'Sắp khai giảng', ONGOING: 'Đang diễn ra', FULL: 'Đã đủ chỗ', FINISHED: 'Đã kết thúc',
  ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', STUDYING: 'Đang học', RESERVED: 'Bảo lưu', TRANSFERRED: 'Đã chuyển lớp',
  COMPLETED: 'Đã hoàn thành', CANCELLED: 'Đã hủy', SCHEDULED: 'Đã lên lịch', REGULAR: 'Thông thường', MAKEUP: 'Học bù',
  NOT_STARTED: 'Chưa diễn ra', NOT_RECORDED: 'Chưa điểm danh', PRESENT: 'Có mặt', ABSENT: 'Vắng', LATE: 'Đi muộn', EXCUSED: 'Vắng có phép',
  GRADED: 'Đã chấm', NOT_GRADED: 'Chưa chấm', CURRENT: 'Điểm hiện hành', PUBLISHED: 'Điểm đã công bố', FROZEN: 'Đã chốt', SAVED_GRADES_ONLY: 'Các điểm đã lưu',
  UNPAID: 'Chưa đóng', PARTIAL: 'Đóng một phần', PAID: 'Đã đóng đủ', PENDING: 'Đang chờ', VOIDED: 'Đã hủy', REFUNDED: 'Đã hoàn',
  NEW: 'Mới tiếp nhận', CONTACTED: 'Đã liên hệ', INTERESTED: 'Đang quan tâm', CONVERTED: 'Đã đăng ký', LOST: 'Ngừng theo dõi',
};
const money = new Set(['tuitionFee', 'amount', 'paidAmount', 'balance', 'credit', 'voidedAmount', 'refundedAmount', 'availableAmount']);
const dates = new Set(['startDate', 'endDate', 'sessionDate', 'examDate', 'dueDate', 'paidAt', 'nextContactAt', 'publishedAt']);
function display(key: string, value: unknown): string {
  if (value === null) return key === 'score' ? 'Chưa chấm' : 'Chưa xác định';
  if (typeof value === 'boolean') return value ? 'Có' : 'Chưa';
  if (typeof value === 'number') return money.has(key) ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : new Intl.NumberFormat('vi-VN').format(value);
  if (typeof value !== 'string') return '—';
  if (key === 'priorityReason') return ({ OVERDUE: 'Lịch hẹn đã quá giờ', TODAY: 'Hẹn trong hôm nay', UNSCHEDULED: 'Chưa có lịch hẹn', UPCOMING: 'Lịch hẹn sắp tới' } as Record<string, string>)[value] ?? value;
  if (key === 'relationship') return ({ ACTIVE: 'Đang có lớp hiệu lực', NOT_STARTED: 'Đã đăng ký, chưa khai giảng', INACTIVE: 'Không có kỳ học hiệu lực' } as Record<string, string>)[value] ?? terms[value] ?? value;
  if (dates.has(key) && Number.isFinite(Date.parse(value))) return new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...(value.length === 10 ? { dateStyle: 'short' as const } : { dateStyle: 'short' as const, timeStyle: 'short' as const }) });
  return Object.hasOwn(terms, value) ? terms[value] : value;
}
export function AssistantResults({ cards, onNavigate, canNavigate }: { cards: AssistantCard[]; onNavigate: (path: unknown, branch?: unknown) => void; canNavigate: (path: unknown, branch?: unknown) => boolean }) {
  return cards.map((card, i) => {
    const parent = object(card.data);
    return <S.Result key={i} aria-label={card.title}>
      <h4>{card.title}</h4>
      {['NOT_STARTED', 'CANCELLED'].includes(String(parent.state)) && <p>{display('state', parent.state)}</p>}
      {assistantRows(card.data).map((row, index) => {
        const fields = { ...Object.fromEntries(Object.entries(parent).filter(([key]) => ['maxScore', 'view'].includes(key))), ...row };
        const name = row.name ?? row.fullName ?? row.studentName ?? row.className ?? row.examName ?? row.receiptNo;
        const code = row.code ?? row.studentCode ?? row.classCode;
        const target = row.path ?? parent.path;
        const branch = 'branchId' in row ? row.branchId : parent.branchId;
        return <div className="result-row" key={index}>
          {(typeof name === 'string' || typeof code === 'string') && <div className="result-name">{typeof code === 'string' ? code + ' · ' : ''}{typeof name === 'string' ? name : ''}</div>}
          <dl>{Object.entries(fields).filter(([key, value]) => Object.hasOwn(labels, key) && (value === null || ['string', 'number', 'boolean'].includes(typeof value))).map(([key, value]) => <Fragment key={key}><dt>{labels[key]}</dt><dd>{display(key, value)}</dd></Fragment>)}</dl>
          {canNavigate(target, branch) && <Button type="link" size="small" icon={<ArrowUpRight size={14} />} onClick={() => onNavigate(target, branch)}>Mở chi tiết</Button>}
        </div>;
      })}
    </S.Result>;
  });
}
