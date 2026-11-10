import {useState} from 'react';
import {useFormLeaveGuard} from '../../hooks/useFormLeaveGuard';
import {Alert,Form,Input,Modal,Select,Typography} from 'antd';
import {documentService} from '../../services/teachingService';
import {getErrorMessage} from '../../utils/apiErrors';
import type {DocumentDto,DocumentStatus} from '../../types/teaching';
export default function ReviewForm({document,onClose,onSaved}:{document:DocumentDto;onClose:()=>void;onSaved:(d:DocumentDto)=>void}){
 const [form]=Form.useForm<{status:Exclude<DocumentStatus,'PENDING'>;reason?:string}>();const status=Form.useWatch('status',form);
 const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 const guard=useFormLeaveGuard(busy,onClose);
 return <Modal open title="Duyệt tài liệu" width={640} okText="Lưu kết quả duyệt" cancelText="Hủy" confirmLoading={busy} onOk={()=>form.submit()} onCancel={guard.cancel} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
  <Typography.Paragraph><strong>{document.title}</strong> · {document.filename}</Typography.Paragraph>
  {error&&<Alert type="error" showIcon title={error} style={{marginBottom:16}}/>}
  <Form form={form} layout="vertical" initialValues={{status:'APPROVED'}} disabled={busy} onValuesChange={guard.changed} onFinish={async v=>{
   if(busy)return;setBusy(true);setError(undefined);try{onSaved(await documentService.review(document.id,v.status,v.reason?.trim()||undefined,document.version));}catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}
  }}>
   <Form.Item name="status" label="Kết quả" rules={[{required:true}]}><Select options={[{value:'APPROVED',label:'Duyệt'},{value:'REJECTED',label:'Từ chối'}]}/></Form.Item>
   {status==='REJECTED'&&<Form.Item name="reason" label="Lý do từ chối" rules={[{required:true,whitespace:true},{max:500}]}><Input.TextArea rows={3} maxLength={500}/></Form.Item>}
  </Form>
  <Alert showIcon type="info" title="Chỉ duyệt tài liệu đang chờ. Kết quả được lưu kèm người và thời gian duyệt."/>
 </Modal>;
}
