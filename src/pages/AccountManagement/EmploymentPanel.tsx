import {useState} from 'react';
import {Alert,DatePicker,Descriptions,Form,Input,Modal,Select,Space,Table} from 'antd';
import dayjs from 'dayjs';
import type {Dayjs} from 'dayjs';
import type {UserResponse} from '../../types/auth';
import {api} from '../../api/axiosInstance';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {getErrorMessage} from '../../utils/apiErrors';
import {displayDate} from '../../utils/display';
type Employment={accountId:number;personnelCode:string;version:number;workStatus:'ACTIVE'|'INACTIVE';hireDate:string|null;endDate:string|null};
type Event={id:number;actorId:number;reason:string;occurredAt:string;beforeState:string;afterState:string};
type Values={workStatus:'ACTIVE'|'INACTIVE';hireDate?:Dayjs;endDate?:Dayjs;reason:string};
const load=async({id}:{id:number},signal?:AbortSignal)=>(await api.get<Employment>('/auth/accounts/'+id+'/employment',{signal})).data;
const loadHistory=async({id}:{id:number},signal?:AbortSignal)=>(await api.get<Event[]>('/auth/accounts/'+id+'/employment/history',{signal})).data;
export default function EmploymentPanel({account,onClose,onSaved}:{account:UserResponse;onClose:()=>void;onSaved:()=>void}){
 const state=useRemoteResource(load,{id:account.accountId});const history=useRemoteResource(loadHistory,{id:account.accountId});
 const [form]=Form.useForm<Values>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 async function save(v:Values){if(busy||!state.data)return;setBusy(true);setError(undefined);try{await api.patch('/auth/accounts/'+account.accountId+'/employment',{version:state.data.version,workStatus:v.workStatus,hireDate:v.hireDate?.format('YYYY-MM-DD')??null,endDate:v.workStatus==='INACTIVE'?v.endDate?.format('YYYY-MM-DD')??null:null,reason:v.reason.trim()});onSaved();}catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}}
 const p=state.data;
 return <Modal open title={'Hồ sơ làm việc · '+(account.personnelCode||account.username)} width={720} okText="Lưu thay đổi" cancelText="Đóng" onOk={()=>form.submit()} onCancel={()=>{if(!busy)onClose();}} confirmLoading={busy} okButtonProps={{disabled:!p}} closable={!busy} maskClosable={!busy}>
 <Space orientation="vertical" style={{width:'100%'}}>
 <Alert type="info" showIcon title="Trạng thái làm việc độc lập với khóa tài khoản và phân công chi nhánh." description="Ngừng làm việc cần bàn giao khách hàng đang chăm sóc. Nhân sự ngừng làm việc không thể đăng nhập. Thay đổi hồ sơ thu hồi phiên; kích hoạt làm việc không tự mở tài khoản đã khóa."/>
 {(error||state.error)&&<Alert type="error" showIcon title={error||state.error}/>}
 {p&&<><Descriptions items={[{key:'code',label:'Mã nhân sự',children:p.personnelCode},{key:'account',label:'Đăng nhập',children:account.status?'Được mở':'Đã khóa'}]}/>
 <Form key={p.version} form={form} layout="vertical" onFinish={save} disabled={busy} initialValues={{workStatus:p.workStatus,hireDate:p.hireDate?dayjs(p.hireDate):undefined,endDate:p.endDate?dayjs(p.endDate):dayjs()}}>
 <Form.Item name="workStatus" label="Trạng thái làm việc" rules={[{required:true}]}><Select options={[{value:'ACTIVE',label:'Đang làm việc'},{value:'INACTIVE',label:'Ngừng làm việc'}]}/></Form.Item>
 <Form.Item name="hireDate" label="Ngày vào làm"><DatePicker format="DD/MM/YYYY" disabledDate={d=>d.isAfter(dayjs(),'day')}/></Form.Item>
 <Form.Item noStyle shouldUpdate={(a,b)=>a.workStatus!==b.workStatus}>{({getFieldValue})=>getFieldValue('workStatus')==='INACTIVE'&&<Form.Item name="endDate" label="Ngày kết thúc" rules={[{required:true}]}><DatePicker format="DD/MM/YYYY" disabledDate={d=>d.isAfter(dayjs(),'day')}/></Form.Item>}</Form.Item>
 <Form.Item name="reason" label="Lý do" rules={[{required:true,whitespace:true,min:3,max:255}]}><Input.TextArea rows={2} maxLength={255}/></Form.Item>
 </Form></>}
 {history.error&&<Alert type="error" title={history.error}/>}
 <Table<Event> size="small" rowKey="id" loading={history.loading} dataSource={history.data} pagination={{pageSize:5}} columns={[{title:'Thời điểm',dataIndex:'occurredAt',render:v=>displayDate(v)},{title:'Người sửa',dataIndex:'actorId'},{title:'Lý do',dataIndex:'reason'}]}/>
 </Space></Modal>;
}
