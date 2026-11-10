import { Tag } from 'antd';
import { DELIVERY_LABELS, LEAD_LABELS, STUDENT_LABELS, STUDY_LABELS } from '../../../utils/admissions';
import type { DeliveryState, LeadState, StudentState, StudyState } from '../../../types/admissions';
export function LeadTag({ value }: { value: LeadState }) {
  return <Tag color={value === 'CONVERTED' ? 'green' : value === 'CONSULTING' ? 'blue' : value === 'LOST' ? 'default' : 'cyan'}>{LEAD_LABELS[value]}</Tag>;
}
export function StudentTag({ value }: { value: StudentState }) {
  return <Tag color={value === 'STUDYING' ? 'green' : value === 'PAUSED' ? 'orange' : 'default'}>{STUDENT_LABELS[value]}</Tag>;
}
export function StudyTag({ value }: { value: StudyState }) {
  return <Tag color={value === 'STUDYING' ? 'green' : value === 'RESERVED' ? 'orange' : value === 'TRANSFERRED' ? 'blue' : 'default'}>{STUDY_LABELS[value]}</Tag>;
}
export function DeliveryTag({ value }: { value: DeliveryState }) {
  return <Tag color={value === 'CREATED' ? 'green' : value === 'FAILED' ? 'red' : 'orange'}>{DELIVERY_LABELS[value] ?? 'Chưa xác định'}</Tag>;
}
