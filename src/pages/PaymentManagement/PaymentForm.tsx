import { useState } from 'react';
import axios from 'axios';
import { Alert, Button, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Typography } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { usePendingPayment } from '../../hooks/usePendingPayment';
import { paymentService } from '../../services/financeService';
import { clearPending, savePending } from '../../utils/pendingPayment';
import { canCollect, METHOD_LABELS, validateCollection } from '../../utils/finance';
import { money } from '../../utils/academic';
import { getErrorMessage } from '../../utils/apiErrors';
import type { PaymentDto, PaymentMethod, PendingPayment, TuitionDto } from '../../types/finance';
interface Values { amount: number; paymentMethod: PaymentMethod; referenceCode?: string; note?: string }
export default function PaymentForm({ tuition, onClose, onSaved }: { tuition?: TuitionDto | null; onClose: () => void; onSaved: (payment: PaymentDto) => void }) {
 const { user } = useAuth();
 const pending = usePendingPayment();
 const [form] = Form.useForm<Values>();
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState<string>();
 const draft = pending.draft;
 async function send(d: PendingPayment) {
  if (busy || !user || d.accountId !== user.accountId) return;
  setBusy(true); setError(undefined);
  const attempt = { ...d, rejected: false, error: undefined };
  try {
   savePending(attempt); // Persist the exact payload before sending; retries never use edited form values.
   const receipt = await paymentService.create(attempt.request);
   clearPending(user.accountId, attempt.request.requestKey);
   onSaved(receipt); // Refresh/detail requests happen separately in the parent.
  } catch (e) {
   const message = getErrorMessage(e); setError(message);
   const status = axios.isAxiosError(e) ? e.response?.status : undefined;
   const rejected = !!status && [400,403,404,409,422].includes(status) && !message.includes('requestKey');
   try { savePending({ ...attempt, rejected, error: message }); } catch { /* Keep the original durable request. */ }
  } finally { setBusy(false); }
 }
 async function create(values: Values) {
  if (!tuition || !user || busy || draft || pending.error) return;
  try {
   if (!canCollect(tuition)) throw new Error('Khoản học phí này không còn đủ điều kiện thu.');
   validateCollection(values.amount, tuition.balance);
   const d: PendingPayment = { accountId: user.accountId, branchId: tuition.branchId,
    studentName: tuition.studentName || '#'+tuition.studentId, className: tuition.className || '#'+tuition.classId,
    createdAt: new Date().toISOString(), request: { tuitionId: tuition.id, amount: values.amount, paymentMethod: values.paymentMethod,
     referenceCode: values.referenceCode?.trim() || undefined, note: values.note?.trim() || undefined, requestKey: crypto.randomUUID() } };
   await send(d);
  } catch (e) { setError(getErrorMessage(e)); }
 }
 return <Modal open title={draft ? 'Xác nhận yêu cầu thu tiền đang chờ' : 'Thu học phí'} width={720}
  footer={null} closable={!busy} maskClosable={!busy} onCancel={() => { if (!busy) onClose(); }}>
  {(error || draft?.error || pending.error) && <Alert type="error" showIcon title={error || draft?.error || pending.error} style={{ marginBottom: 16 }} />}
  {draft ? <>
   <Alert type={draft.rejected ? 'error' : 'warning'} showIcon style={{ marginBottom: 16 }}
    title={draft.rejected ? 'Máy chủ đã từ chối yêu cầu này' : 'Chưa xác nhận kết quả thu tiền'}
    description={draft.rejected ? 'Có thể kiểm tra lại học phí, thử lại đúng yêu cầu hoặc hủy yêu cầu bị từ chối để nhập lại.'
     : 'Yêu cầu đã được giữ nguyên. Bấm xác nhận lại để lấy kết quả; hệ thống không thu lần hai nếu khoản này đã được lưu. Không xóa dữ liệu trình duyệt khi chưa xác nhận xong.'} />
   <Descriptions bordered column={1} items={[
    {key:'student',label:'Học viên',children:draft.studentName}, {key:'class',label:'Lớp',children:draft.className},
    {key:'tuition',label:'Học phí',children:'#'+draft.request.tuitionId}, {key:'amount',label:'Số tiền',children:money(draft.request.amount)},
    {key:'method',label:'Phương thức',children:METHOD_LABELS[draft.request.paymentMethod]},
    {key:'ref',label:'Mã giao dịch',children:draft.request.referenceCode || '—'}, {key:'note',label:'Ghi chú',children:draft.request.note || '—'},
   ]} />
   <Space wrap style={{ marginTop: 20 }}>
    <Button type="primary" loading={busy} onClick={() => void send(draft)}>Xác nhận lại yêu cầu</Button>
    {draft.rejected && <Popconfirm title="Hủy yêu cầu đã bị từ chối?" okText="Hủy yêu cầu" cancelText="Quay lại"
     onConfirm={() => { clearPending(draft.accountId, draft.request.requestKey); onClose(); }}>
     <Button danger disabled={busy}>Hủy yêu cầu bị từ chối</Button></Popconfirm>}
    <Button disabled={busy} onClick={onClose}>Đóng, xử lý sau</Button>
   </Space>
  </> : tuition && !pending.error ? <>
   <Descriptions size="small" column={1} items={[
    {key:'student',label:'Học viên',children:tuition.studentName || '#'+tuition.studentId},
    {key:'class',label:'Lớp ghi danh gốc',children:tuition.className || '#'+tuition.classId},
    {key:'paid',label:'Đã thu',children:money(tuition.paidAmount)}, {key:'balance',label:'Còn nợ',children:<strong>{money(tuition.balance)}</strong>},
   ]} />
   <Form form={form} layout="vertical" initialValues={{ amount: tuition.balance, paymentMethod: 'CASH' }} onFinish={create} disabled={busy}>
    <Form.Item name="amount" label="Số tiền thu (VND)" rules={[{ required: true, message: 'Nhập số tiền thu.' },
     { validator: (_, value) => { try { validateCollection(value, tuition.balance); return Promise.resolve(); } catch(e) { return Promise.reject(e); } } }]}>
     <InputNumber min={0.01} max={tuition.balance} precision={2} style={{ width: '100%' }} /></Form.Item>
    <Form.Item name="paymentMethod" label="Phương thức" rules={[{ required: true }]}>
     <Select options={[{ value:'CASH',label:'Tiền mặt' },{ value:'BANK_TRANSFER',label:'Chuyển khoản' }]} /></Form.Item>
    <Form.Item name="referenceCode" label="Mã giao dịch / tham chiếu" rules={[{ max:100 }]} extra="Ghi mã chuyển khoản nếu có để đối chiếu."><Input maxLength={100} /></Form.Item>
    <Form.Item name="note" label="Ghi chú" rules={[{ max:500 }]}><Input.TextArea maxLength={500} rows={3} /></Form.Item>
    <Typography.Paragraph type="secondary">Chỉ xác nhận khi đã nhận được tiền. Sĩ số lớp và trạng thái học không thay đổi khi thu tiền.</Typography.Paragraph>
    <Space><Button type="primary" htmlType="submit" loading={busy} disabled={!canCollect(tuition)}>Xác nhận đã thu tiền</Button><Button disabled={busy} onClick={onClose}>Hủy</Button></Space>
   </Form>
  </> : null}
 </Modal>;
}
