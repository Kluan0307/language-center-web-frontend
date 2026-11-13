import { Alert, Button } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export default function AssignedScopeBanner() { const { user } = useAuth(); const [p, set] = useSearchParams(); if (user?.role !== 'ADMIN' || p.get('allAssigned') !== 'true')
    return null; return <Alert showIcon type="info" title="Đang xem tất cả chi nhánh được phân công" action={<Button onClick={() => set(old => { const n = new URLSearchParams(old); n.delete('allAssigned'); n.delete('branchId'); n.set('page', '0'); return n; })}>Về chi nhánh đang làm việc</Button>}/>; }
