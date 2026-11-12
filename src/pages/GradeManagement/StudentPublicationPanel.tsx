import {useEffect,useRef,useState} from 'react';
import {Alert,Button,Input,Space,Typography} from 'antd';
import {api} from '../../api/axiosInstance';
import {getErrorMessage} from '../../utils/apiErrors';
type State={revision:number;published:boolean;publishedAt:string|null;candidates:number;graded:number;draftFingerprint:string;draftChanged:boolean};
type Intent={requestId:string;expectedRevision:number;draftFingerprint:string;reason:string};
export default function StudentPublicationPanel({examId}:{examId:number}){
 const [state,setState]=useState<State>();const [error,setError]=useState<string>();const [reason,setReason]=useState('');const [busy,setBusy]=useState(false);const [pending,setPending]=useState<{intent:Intent;retract:boolean}>();const generation=useRef(0);
 const base='/teaching/exams/'+examId;
 useEffect(()=>{const epoch=++generation.current;const controller=new AbortController();void api.get<State>(base+'/student-publication',{signal:controller.signal}).then(r=>{if(epoch===generation.current)setState(r.data);}).catch(e=>{if(!controller.signal.aborted&&epoch===generation.current)setError(getErrorMessage(e));});return()=>{controller.abort();generation.current=epoch+1;};},[base]);
 async function submit(retract:boolean){if(busy||!state)return;const epoch=generation.current;const op=pending??{intent:{requestId:crypto.randomUUID(),expectedRevision:state.revision,draftFingerprint:state.draftFingerprint,reason:reason.trim()},retract};setPending(op);setBusy(true);setError(undefined);try{const r=await api.post<State>(base+'/student-publications'+(op.retract?'/retract':''),op.intent);if(epoch===generation.current){setState(r.data);setPending(undefined);setReason('');}}catch(e){if(epoch===generation.current)setError(getErrorMessage(e));}finally{if(epoch===generation.current)setBusy(false);}}
 async function recover(){if(!pending||busy)return;const epoch=generation.current;setBusy(true);try{const r=await api.get<State>(base+'/student-publication/requests/'+pending.intent.requestId);if(epoch===generation.current){setState(r.data);setPending(undefined);setError(undefined);setReason('');}}catch(e){if(epoch===generation.current)setError(getErrorMessage(e));}finally{if(epoch===generation.current)setBusy(false);}}
 return <Space orientation="vertical" style={{width:'100%',marginBottom:16}}>
 <Typography.Title level={5}>Công bố cho học viên</Typography.Title>
 {error&&<Alert type="error" showIcon title={error}/>}
 {!state?<Button onClick={()=>window.location.reload()}>Tải lại trạng thái công bố</Button>:<>
 <Alert type={state.draftChanged?'warning':'info'} showIcon title={state.published?'Đang công bố · phiên bản '+state.revision:'Chưa công bố cho học viên'} description={state.draftChanged?'Điểm nháp đã thay đổi. Học viên vẫn xem bản công bố trước cho tới khi công bố lại.':`${state.graded}/${state.candidates} bài đã chấm. Chỉ nhận xét dành cho học viên được công bố; ghi chú nội bộ được giữ riêng.`}/>
 <Input.TextArea aria-label="Lý do công bố" placeholder="Lý do công bố hoặc thu hồi" maxLength={500} value={pending?.intent.reason??reason} disabled={busy||!!pending} onChange={e=>setReason(e.target.value)} rows={2}/>
 <Space wrap>
 <Button type="primary" loading={busy} disabled={!reason.trim()&&!pending||!!pending&&pending.retract} onClick={()=>void submit(false)}>{pending&&!pending.retract?'Gửi lại yêu cầu công bố':state.published?'Công bố lại':'Công bố điểm'}</Button>
 <Button danger disabled={!state.published||!reason.trim()&&!pending||!!pending&&!pending.retract} loading={busy} onClick={()=>void submit(true)}>{pending?.retract?'Gửi lại yêu cầu thu hồi':'Thu hồi'}</Button>
 {pending&&<Button disabled={busy} onClick={()=>void recover()}>Kiểm tra yêu cầu vừa gửi</Button>}
 </Space>
 {pending&&<Typography.Text type="secondary">Yêu cầu chưa được xác nhận. Gửi lại giữ nguyên mã yêu cầu và nội dung để tránh công bố hai lần. Nếu dữ liệu đã thay đổi, tải lại trang để xem trạng thái mới.</Typography.Text>}
 </>}
 </Space>;
}
