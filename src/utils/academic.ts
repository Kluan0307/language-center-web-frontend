import type { Branch } from '../types/branch';
import type { Role } from '../types/auth';
import type { CourseDto, ClassProgress, Weekday, ScheduleSlot } from '../types/academic';

export const DAYS: { value: Weekday; label: string }[] = [
  { value: 'MONDAY', label: 'Thứ hai' }, { value: 'TUESDAY', label: 'Thứ ba' },
  { value: 'WEDNESDAY', label: 'Thứ tư' }, { value: 'THURSDAY', label: 'Thứ năm' },
  { value: 'FRIDAY', label: 'Thứ sáu' }, { value: 'SATURDAY', label: 'Thứ bảy' },
  { value: 'SUNDAY', label: 'Chủ nhật' },
];
export const PROGRESS: Record<ClassProgress, string> = { UPCOMING: 'Sắp diễn ra', ONGOING: 'Đang học', FINISHED: 'Đã kết thúc' };
export const dayLabel = (day: Weekday) => DAYS.find((d) => d.value === day)?.label ?? day;
export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
export const canPlan = (role: Role) => role === 'SUPER_ADMIN' || role === 'ADMIN';
export const canEditCourse = (role: Role, course: Pick<CourseDto, 'branchId'>) =>
  role === 'SUPER_ADMIN' || ((role === 'ADMIN' || role === 'STAFF') && course.branchId !== null);
export function businessDate(): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts();
  const field = (name: string) => parts.find((part) => part.type === name)?.value;
  return `${field('year')}-${field('month')}-${field('day')}`;
}
export function dateProgress(start: string, end: string, today = businessDate()): ClassProgress {
  return today < start ? 'UPCOMING' : today > end ? 'FINISHED' : 'ONGOING';
}
export function validateSlots(slots: ScheduleSlot[]) {
  const days = new Set<Weekday>();
  for (const slot of slots) {
    if (days.has(slot.dayOfWeek)) throw new Error('Mỗi lớp chỉ có một buổi trong cùng một ngày trong tuần.');
    if (slot.startTime >= slot.endTime) throw new Error('Giờ kết thúc phải sau giờ bắt đầu.');
    days.add(slot.dayOfWeek);
  }
}
export const conflictReason = (value: string) => value
  .replaceAll('Only one session per class/day is supported', 'Lớp đã có lịch trong ngày này')
  .replaceAll('Student timetable conflict', 'Trùng lịch học viên');

export function branchLabel(branches: Branch[] | undefined, id: number | null) {
  if (id === null) return 'Khóa chung';
  const branch = branches?.find((b) => b.id === id);
  return branch ? `${branch.code} · ${branch.name}` : `Chi nhánh #${id}`;
}
