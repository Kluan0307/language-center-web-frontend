import { Alert, Button, Modal, Skeleton } from 'antd';
import { usePendingPayment } from '../../hooks/usePendingPayment';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { tuitionService } from '../../services/financeService';
import { canCollect } from '../../utils/finance';
import { LoadError } from '../../components/Common/Academic';
import PaymentForm from './PaymentForm';
import type { PaymentDto } from '../../types/finance';
export default function PaymentFlow({ tuitionId, onClose, onSaved }: { tuitionId: number | null; onClose:()=>void; onSaved:(p:PaymentDto)=>void }) {
 const pending=usePendingPayment();
 const current=useRemoteResource(tuitionService.detail,{id:pending.draft || pending.error ? null : tuitionId});
 if(pending.draft)return <PaymentForm onClose={onClose} onSaved={onSaved} />;
 if(current.loading || current.error || !current.data || !canCollect(current.data))return <Modal open title="Thu học phí" onCancel={onClose} footer={<Button onClick={onClose}>Đóng</Button>}>
  {current.loading?<Skeleton active/>:<><LoadError error={current.error} reload={current.reload}/><Alert showIcon type="warning" title={pending.error || (!current.error?'Khoản học phí không còn đủ điều kiện thu. Hãy tải lại danh sách.':'Hãy thử tải lại để xem số dư mới nhất.')} /></>}
 </Modal>;
 return <PaymentForm tuition={current.data} onClose={onClose} onSaved={onSaved}/>;
}
