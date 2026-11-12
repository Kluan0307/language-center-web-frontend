import {useState} from 'react';
import {Alert,Form,Input,InputNumber,Modal,Typography} from 'antd';
import {useAuth} from '../../hooks/useAuth';
import {gradeService} from '../../services/teachingService';
import {isTeachingManager,validateScore} from '../../utils/teaching';
import {applyFormErrors,getErrorMessage} from '../../utils/apiErrors';
import type {ExamDto,GradeDto} from '../../types/teaching';
export default function GradeForm({exam,studentId,studentName,grade,onClose,onSaved}:{exam:ExamDto;studentId:number;studentName:string;grade?:GradeDto;onClose:()=>void;onSaved:(grade:GradeDto)=>void}){
 const {user}=useAuth();const admin=isTeachingManager(user?.role);const [form]=Form.useForm<{score:number;comment?:string;reason?:string;studentComment?:string}>();
 const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();
 return <Modal open title={admin?'Hiệu chỉnh điểm':'Nhập / cập nhật điểm'} width={650} okText="Lưu điểm" cancelText="Hủy" confirmLoading={busy} onOk={()=>form.submit()} onCancel={()=>{if(!busy)onClose();}} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
  <Typography.Paragraph><strong>{studentName}</strong> · {exam.name} · Thang điểm {exam.maxScore}</Typography.Paragraph>
  {error&&<Alert type="error" showIcon title={error} style={{marginBottom:16}}/>}
  <Form form={form} layout="vertical" disabled={busy} initialValues={{score:grade?.score,comment:grade?.comment??undefined,studentComment:grade?.studentComment??undefined}} onFinish={async v=>{
   if(busy)return;setError(undefined);
   try{validateScore(v.score,exam.maxScore);setBusy(true);onSaved(await gradeService.save({examId:exam.id,studentId,score:v.score,comment:v.comment?.trim()||undefined,reason:v.reason?.trim()||undefined,studentComment:v.studentComment?.trim()||undefined}));}
   catch(e){applyFormErrors(form,e);setError(getErrorMessage(e));}finally{setBusy(false);}
  }}>
   <Form.Item name="score" label="Điểm" rules={[{required:true,message:'Nhập điểm.'},{validator:(_,v)=>{try{validateScore(v,exam.maxScore);return Promise.resolve();}catch(e){return Promise.reject(e);}}}]}><InputNumber min={0} max={exam.maxScore} precision={2} style={{width:'100%'}}/></Form.Item>
   <Form.Item name="comment" label="Ghi chú nội bộ" rules={[{max:1000}]}><Input.TextArea rows={3} maxLength={1000}/></Form.Item>
   <Form.Item name="studentComment" label="Nhận xét dành cho học viên" rules={[{max:1000}]}><Input.TextArea rows={3} maxLength={1000}/></Form.Item>
   <Form.Item name="reason" label={admin?'Lý do hiệu chỉnh':'Lý do cập nhật (nếu có)'} rules={[{required:admin,whitespace:true,message:'Nhập lý do hiệu chỉnh.'},{max:500}]}><Input.TextArea rows={2} maxLength={500}/></Form.Item>
  </Form>
  <Alert type="info" showIcon title={admin?'Quản lý chỉ sửa điểm đã có, không nhập điểm ban đầu':'Chỉ nhập điểm cho học viên thuộc danh sách dự thi theo ngày thi'}
   description="Cập nhật giữ người nhập ban đầu và lưu lịch sử thay đổi. Bài chưa có điểm không được tự tính là 0."/>
 </Modal>;
}
