import { Alert, Button, Descriptions, Space, Tag, Typography } from 'antd';
import { ContextLink } from '../ContextLink';
import { usePendingPayment } from '../../../hooks/usePendingPayment';
import { money } from '../../../utils/academic';
import { displayDate } from '../../../utils/display';
import { TUITION_LABELS, METHOD_LABELS, PAYMENT_LABELS } from '../../../utils/finance';
import type { PaymentDto, TuitionDto } from '../../../types/finance';
export function TuitionTag({ tuition }: {
    tuition: Pick<TuitionDto, 'status' | 'overdue'>;
}) {
    return <Space wrap><Tag color={tuition.status === 'PAID' ? 'green' : tuition.status === 'CANCELLED' ? 'default' : tuition.status === 'PARTIAL' ? 'blue' : 'orange'}>{TUITION_LABELS[tuition.status]}</Tag>
 {tuition.overdue && <Tag color="red">Quá hạn</Tag>}</Space>;
}
export function PendingPaymentBanner({ onResume }: {
    onResume: () => void;
}) {
    const pending = usePendingPayment();
    if (pending.error)
        return <Alert type="error" showIcon title={pending.error}/>;
    if (!pending.draft)
        return null;
    return <Alert type="warning" showIcon title="Có yêu cầu thu tiền chưa xác nhận" style={{ marginBottom: 16 }} description={pending.draft.studentName + ' · ' + money(pending.draft.request.amount) + '. Mở lại yêu cầu để xác nhận kết quả trước khi thu khoản mới.'} action={<Button onClick={onResume}>Mở yêu cầu</Button>}/>;
}
export function ReceiptDetails({ receipt }: {
    receipt: PaymentDto;
}) {
    return <><Descriptions bordered column={1} items={[
            { key: 'receipt', label: 'Số phiếu', children: receipt.receiptNo || '#' + receipt.id },
            { key: 'tuition', label: 'Khoản học phí', children: <ContextLink to={'/tuition?tuitionId=' + receipt.tuitionId}>#{receipt.tuitionId} · Xem học phí</ContextLink> },
            { key: 'source', label: 'Nguồn thu', children: receipt.source === 'ONLINE' && receipt.onlineOrderId ? <ContextLink to={'/online-payments?orderId=' + receipt.onlineOrderId + '&branchId=' + receipt.branchId}>VNPAY online</ContextLink> : receipt.source === 'DIRECT' ? 'Thu trực tiếp' : 'Xem giao dịch liên quan để xác minh' },
            { key: 'amount', label: 'Số tiền', children: <strong>{money(receipt.amount)}</strong> },
            { key: 'method', label: 'Phương thức', children: METHOD_LABELS[receipt.paymentMethod] },
            { key: 'voided', label: 'Đã đảo', children: money(receipt.voidedAmount) }, { key: 'refunded', label: 'Đã hoàn', children: money(receipt.refundedAmount) }, { key: 'remaining', label: 'Còn hiệu lực', children: money(receipt.availableAmount) },
            { key: 'status', label: 'Trạng thái phiếu gốc', children: PAYMENT_LABELS[receipt.status] },
            { key: 'reference', label: 'Mã giao dịch', children: receipt.referenceCode || '—' },
            { key: 'date', label: 'Thời gian thu', children: displayDate(receipt.paidAt) },
            { key: 'by', label: 'Người thu', children: receipt.recordedByName || '—' },
            { key: 'note', label: 'Ghi chú', children: <span style={{ whiteSpace: 'pre-wrap' }}>{receipt.note || '—'}</span> },
        ]}/><Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>Phiếu thu đã lưu không được sửa hoặc xóa. Thu trực tiếp do nhân viên ghi nhận; phiếu online được tạo từ bằng chứng cổng thanh toán. Đảo/hoàn trên sổ thu không tự hoàn tiền qua ngân hàng.</Typography.Paragraph></>;
}
