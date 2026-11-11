import {useState} from 'react';
import {Alert,App,Form,Modal,Select,Space,Tag,Typography} from 'antd';
import type {UserResponse} from '../../types/auth';
import type {Branch} from '../../types/branch';
import {authService} from '../../services/authService';
import {getErrorMessage} from '../../utils/apiErrors';
import {useRemoteResource} from '../../hooks/useRemoteResource';
async function load({id}:{id:number},signal?:AbortSignal){const [assignments,events]=await Promise.all([authService.branchAssignments(id,signal),authService.branchAssignmentHistory(id,signal)]);return {assignments,events};}
export default function BranchAssignments({account,branches,onClose,onSaved}:{account:UserResponse;branches?:Branch[];onClose:()=>void;onSaved:(account:UserResponse)=>void}){
 const [form]=Form.useForm<{branchIds:number[];primaryBranchId?:number}>();const ids=Form.useWatch('branchIds',form)??[];
 const [saving,setSaving]=useState(false);const [error,setError]=useState<string>();const {message}=App.useApp();
 const history=useRemoteResource(load,{id:account.accountId});
 const label=(id:number)=>branches?.find(b=>b.id===id)?.name??'Chi nhánh #'+id;
 async function save(values:{branchIds:number[];primaryBranchId?:number}){
  setSaving(true);setError(undefined);
  try{const saved=await authService.assignBranches(account.accountId,{branchIds:values.branchIds,primaryBranchId:values.branchIds.length?values.primaryBranchId:null});message.success('Đã cập nhật phân công chi nhánh.');onSaved(saved);}
  catch(e){setError(getErrorMessage(e));}finally{setSaving(false);}
 }
 return <Modal title={'Phân công chi nhánh · '+account.username} open width={640} onCancel={()=>{if(!saving)onClose();}} onOk={()=>form.submit()} confirmLoading={saving} cancelButtonProps={{disabled:saving}} maskClosable={!saving} closable={!saving} okText="Lưu phân công" cancelText="Hủy">
 <Form form={form} layout="vertical" onFinish={save} disabled={saving} initialValues={{branchIds:account.branchIds??(account.branchId?[account.branchId]:[]),primaryBranchId:account.branchId??undefined}}>
  <Alert type="info" showIcon title="Phạm vi truy cập theo phân công" description="Admin và Teacher có thể thuộc nhiều chi nhánh. Staff được phân công tối đa một chi nhánh. Bỏ toàn bộ phân công sẽ chặn truy cập nghiệp vụ của tài khoản." style={{marginBottom:16}}/>
  {error&&<Alert type="error" showIcon title={error} style={{marginBottom:16}}/>}
  <Form.Item name="branchIds" label="Chi nhánh được phân công" rules={[{validator:(_,v:number[])=>account.role==='STAFF'&&v?.length>1?Promise.reject(new Error('Staff chỉ được phân công một chi nhánh.')):Promise.resolve()}]}>
   <Select mode="multiple" allowClear showSearch optionFilterProp="label" aria-label="Chi nhánh được phân công" options={branches?.map(b=>({value:b.id,label:b.code+' · '+b.name,disabled:b.status!=='ACTIVE'&&!(account.branchIds??[]).includes(b.id)}))}
    onChange={(next:number[])=>{if(!next.includes(form.getFieldValue('primaryBranchId')))form.setFieldValue('primaryBranchId',next[0]);}}/>
  </Form.Item>
  <Form.Item name="primaryBranchId" label="Chi nhánh chính" rules={[{required:ids.length>0,message:'Chọn chi nhánh chính.'}]}><Select allowClear disabled={ids.length===0||saving} options={ids.map((id:number)=>({value:id,label:label(id)}))}/></Form.Item>
 </Form>
 <Typography.Text strong>Phân công hiện tại và đã thu hồi</Typography.Text>
 {history.error?<Alert type="warning" title={history.error}/>:<Space orientation="vertical" style={{width:'100%',marginTop:8}}>{history.data?.assignments.map(row=><div key={row.branchId}><Tag color={row.status?'blue':'default'}>{label(row.branchId)}</Tag>{row.isPrimary?'Chính · ':''}{row.status?'Đang phân công':'Đã thu hồi'}<Typography.Text type="secondary"> · {row.assignedAt?.replace('T',' ')} · {row.assignedBy ? 'Người phân công #' + row.assignedBy : 'Phân công ban đầu'}</Typography.Text></div>)}</Space>}
 <Typography.Paragraph strong style={{marginTop:16}}>Lịch sử thay đổi phân công</Typography.Paragraph>
 <Space orientation="vertical" style={{width:'100%',maxHeight:200,overflow:'auto'}}>{history.data?.events.map(e=><div key={e.id}>{label(e.branchId)} · {({ASSIGNED:'Được phân công',REVOKED:'Thu hồi phân công',PRIMARY_SET:'Đặt làm chi nhánh chính',PRIMARY_CLEARED:'Bỏ chi nhánh chính',MIGRATED:'Chuyển dữ liệu ban đầu'} as Record<string,string>)[e.action]??e.action}<Typography.Text type="secondary"> · {e.occurredAt.replace('T',' ')} · {e.performedBy ? 'Người thực hiện #' + e.performedBy : 'Hệ thống'}</Typography.Text></div>)}</Space>
 </Modal>;
}
