import type {FinanceDraft} from '../types/financeLedger';
const key=(id:number)=>'lc.pending-finance.'+id;
export function financeSnapshot(id:number|null){return id===null?null:localStorage.getItem(key(id));}
export function parseFinance(raw:string|null):FinanceDraft|null {if(!raw)return null;const d=JSON.parse(raw) as FinanceDraft;if(!Number.isSafeInteger(d.accountId)||!Number.isSafeInteger(d.branchId)||!Number.isSafeInteger(d.tuitionId)||!['ADJUST','CORRECTION'].includes(d.kind)||!d.request?.requestKey||!Number.isSafeInteger(d.request.version)||(d.kind==='CORRECTION'&&!Number.isSafeInteger(d.paymentId)))throw Error('Không đọc được yêu cầu tài chính đang chờ. Giữ dữ liệu trình duyệt và liên hệ quản lý.');return d;}
const changed=()=>window.dispatchEvent(new Event('lc-finance-change'));
export function saveFinance(d:FinanceDraft){const old=parseFinance(financeSnapshot(d.accountId));if(old&&JSON.stringify(old)!==JSON.stringify(d))throw Error('Còn yêu cầu tài chính chưa xác nhận; hãy mở và xử lý trước.');localStorage.setItem(key(d.accountId),JSON.stringify(d));changed();}
export function clearFinance(id:number,requestKey:string){const old=parseFinance(financeSnapshot(id));if(old?.request.requestKey===requestKey){localStorage.removeItem(key(id));changed();}}
export function subscribeFinance(fn:()=>void){window.addEventListener('storage',fn);window.addEventListener('lc-finance-change',fn);return()=>{window.removeEventListener('storage',fn);window.removeEventListener('lc-finance-change',fn);};}
