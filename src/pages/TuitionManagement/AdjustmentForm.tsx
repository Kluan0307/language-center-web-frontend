import FinanceOperationFlow from '../../components/Common/Finance/FinanceOperationFlow';import type {TuitionDto} from '../../types/finance';
export default function AdjustmentForm({tuition,onClose,onSaved}:{tuition:TuitionDto;onClose:()=>void;onSaved:()=>void}){return <FinanceOperationFlow target={{kind:'ADJUST',tuitionId:tuition.id}} onClose={onClose} onSaved={onSaved}/>;}
