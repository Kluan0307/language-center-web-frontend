import type {TuitionAdjustment,PaymentMethod} from './finance';
export interface CorrectionRequest {type:'VOID'|'REFUND';amount:number;paymentMethod?:PaymentMethod;referenceCode?:string;reason:string;requestKey:string;version:number}
export interface Correction extends Omit<CorrectionRequest,'version'> {expectedVersion:number;id:number;paymentId:number;tuitionId:number;branchId:number;createdAt:string;recordedByName:string}
export interface AdjustmentEvent {id:number;tuitionId:number;oldOriginal:number;oldDiscount:number;oldAmount:number;oldDueDate:string;newOriginal:number;newDiscount:number;newAmount:number;newDueDate:string;paidAtChange:number;reason:string;recordedByName:string;createdAt:string}
export interface FinanceHistory {adjustments:AdjustmentEvent[];corrections:Correction[]}
export interface Reconciliation {tuitionId:number;studentName:string;branchId:number;cachedPaid:number;ledgerPaid:number;difference:number;legacyPayments:number}
export type FinanceDraft={accountId:number;branchId:number;tuitionId:number}&({kind:'ADJUST';request:TuitionAdjustment}|{kind:'CORRECTION';paymentId:number;request:CorrectionRequest});
