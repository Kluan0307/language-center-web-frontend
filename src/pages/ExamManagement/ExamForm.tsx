import {useState} from 'react';
import {Alert,DatePicker,Form,Input,InputNumber,Modal,Select} from 'antd';
import dayjs from 'dayjs';
import type {Dayjs} from 'dayjs';
import {examService} from '../../services/teachingService';
import {applyFormErrors,getErrorMessage} from '../../utils/apiErrors';
import type {ClassDto} from '../../types/academic';
import type {ExamDto,ExamRequest} from '../../types/teaching';
type Values=Omit<ExamRequest,'examDate'>&{examDate:Dayjs};
export default function ExamForm({editing,classes,classId,onClose,onSaved}:{editing:ExamDto|null;classes:ClassDto[];classId?:number;onClose:()=>void;onSaved:(exam:ExamDto)=>void}){
 const [form]=Form.useForm<Values>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 async function save(v:Values){if(busy)return;setBusy(true);setError(undefined);try{onSaved(await examService.save(editing?.id??null,{...v,classId:editing?.classId??v.classId,name:v.name.trim(),examType:v.examType.trim(),examDate:v.examDate.format('YYYY-MM-DD')}));}catch(e){applyFormErrors(form,e);setError(getErrorMessage(e));}finally{setBusy(false);}}
 return <Modal open title={editing?'Sửa bài kiểm tra':'Thêm bài kiểm tra'} width={680} okText="Lưu bài kiểm tra" cancelText="Hủy" confirmLoading={busy} onOk={()=>form.submit()} onCancel={()=>{if(!busy)onClose();}} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
  {error&&<Alert showIcon type="error" title={error} style={{marginBottom:16}}/>}
  <Form form={form} layout="vertical" disabled={busy} initialValues={editing?{...editing,examDate:dayjs(editing.examDate)}:{classId,weight:1,maxScore:10}} onFinish={save}>
   <Form.Item name="classId" label="Lớp" rules={[{required:true,message:'Chọn lớp.'}]}><Select disabled={!!editing} showSearch optionFilterProp="label" options={classes.map(c=>({value:c.id,label:c.code+' · '+c.name}))}/></Form.Item>
   <Form.Item name="name" label="Tên bài kiểm tra" rules={[{required:true,whitespace:true},{max:255}]}><Input maxLength={255}/></Form.Item>
   <Form.Item name="examType" label="Loại kiểm tra" rules={[{required:true,whitespace:true},{max:50}]}><Input maxLength={50} placeholder="Ví dụ: Giữa kỳ, Cuối kỳ, Speaking"/></Form.Item>
   <Form.Item name="examDate" label="Ngày kiểm tra" rules={[{required:true}]}><DatePicker format="DD/MM/YYYY" needConfirm={false} style={{width:'100%'}}/></Form.Item>
   <Form.Item name="weight" label="Trọng số tương đối" rules={[{required:true}]} extra="Ví dụ các trọng số 1 và 2 tương ứng tỷ lệ 1:2; không bắt buộc tổng bằng 100."><InputNumber min={0.01} max={100} precision={2} style={{width:'100%'}}/></Form.Item>
   <Form.Item name="maxScore" label="Điểm tối đa" rules={[{required:true}]}><InputNumber min={0.01} max={10000} precision={2} style={{width:'100%'}}/></Form.Item>
  </Form>
  {editing&&<Alert type="info" showIcon title="Không thể đổi trọng số hoặc thang điểm khi đã có điểm" description="Không thể chuyển bài kiểm tra sang lớp khác; bài đã có điểm không được xóa."/>}
 </Modal>;
}
