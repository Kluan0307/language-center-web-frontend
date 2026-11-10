import {useState} from 'react';import {Alert,DatePicker,Form,Modal,Select,Space} from 'antd';import dayjs from 'dayjs';import type {Dayjs} from 'dayjs';
import {sessionService} from '../../services/sessionService';import {getErrorMessage} from '../../utils/apiErrors';import type {ClassDto} from '../../types/academic';
export default function GenerateSessions({classes,classId,onClose,onSaved}:{classes:ClassDto[];classId?:number;onClose:()=>void;onSaved:(count:number)=>void}){
 const [form]=Form.useForm<{classId:number;from?:Dayjs;to?:Dayjs}>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 const selected=classes.find(c=>c.id===classId);
 async function save(v:{classId:number;from?:Dayjs;to?:Dayjs}){if(busy)return;setBusy(true);setError(undefined);try{const r=await sessionService.generate({classId:v.classId,from:v.from?.format('YYYY-MM-DD'),to:v.to?.format('YYYY-MM-DD')});onSaved(r.created);}catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}}
 return <Modal open title="Sinh buổi học từ lịch tuần" onCancel={()=>{if(!busy)onClose();}} onOk={()=>form.submit()} okText="Sinh buổi học" cancelText="Hủy" confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
  <Alert showIcon type="info" title="Chỉ thêm những buổi còn thiếu" description="Không ghi đè buổi đã chỉnh sửa, đã hủy hoặc đã điểm danh. Lịch mẫu phải được cấu hình trước." style={{marginBottom:16}}/>
  {error&&<Alert type="error" title={error}/>}<Form form={form} layout="vertical" onFinish={save} disabled={busy} initialValues={{classId,from:selected?dayjs(selected.startDate):undefined,to:selected?dayjs(selected.endDate):undefined}}>
   <Form.Item name="classId" label="Lớp học" rules={[{required:true,message:'Chọn lớp.'}]}><Select aria-label="Lớp sinh buổi" showSearch optionFilterProp="label" options={classes.map(c=>({value:c.id,label:c.code+' · '+c.name,disabled:c.closed}))} onChange={(id:number)=>{const c=classes.find(c=>c.id===id);form.setFieldsValue({from:c?dayjs(c.startDate):undefined,to:c?dayjs(c.endDate):undefined});}}/></Form.Item>
   <Space wrap><Form.Item name="from" label="Từ ngày"><DatePicker format="DD/MM/YYYY" needConfirm={false}/></Form.Item><Form.Item name="to" label="Đến ngày"><DatePicker format="DD/MM/YYYY" needConfirm={false}/></Form.Item></Space>
  </Form>
 </Modal>;
}
