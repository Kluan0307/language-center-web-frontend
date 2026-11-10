import {useState} from 'react';
import {Alert,DatePicker,Form,Input,Modal,Select,Space,TimePicker} from 'antd';
import dayjs from 'dayjs';import type {Dayjs} from 'dayjs';
import {sessionService} from '../../services/sessionService';import {roomService} from '../../services/academicService';import {authService} from '../../services/authService';
import {useRemoteResource} from '../../hooks/useRemoteResource';import {getErrorMessage} from '../../utils/apiErrors';import {validateSessionTimes} from '../../utils/sessions';
import type {ClassSession} from '../../types/session';
async function lookups({branchId,enabled}:{branchId:number;enabled:boolean},signal?:AbortSignal){if(!enabled)return {rooms:[],teachers:[]};const [rooms,teachers]=await Promise.all([roomService.all({branchId},signal),authService.teachers({branchId},signal)]);return {rooms,teachers};}
export type EditMode='edit'|'cancel'|'restore'|'makeup';
interface Values{sessionDate:Dayjs;startTime:Dayjs;endTime:Dayjs;roomId:number;teacherId:number;reason:string}
export default function SessionEditor({session,mode,onClose,onSaved}:{session:ClassSession;mode:EditMode;onClose:()=>void;onSaved:()=>void}){
 const [form]=Form.useForm<Values>();const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();const details=mode==='edit'||mode==='makeup';
 const options=useRemoteResource(lookups,{branchId:session.branchId,enabled:details});
 async function save(values:Values){if(busy)return;setBusy(true);setError(undefined);try{
  if(details){const startTime=values.startTime.format('HH:mm'),endTime=values.endTime.format('HH:mm');validateSessionTimes(startTime,endTime);const data={sessionDate:values.sessionDate.format('YYYY-MM-DD'),startTime,endTime,roomId:values.roomId,teacherId:values.teacherId,reason:values.reason.trim(),version:session.version};
   if(mode==='edit')await sessionService.edit(session.id,data);else await sessionService.makeup(session.id,data);
  }else await sessionService.action(session.id,mode,{version:session.version,reason:values.reason.trim()});onSaved();
 }catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}}
 const title={edit:'Đổi lịch / phòng / giáo viên',cancel:'Hủy buổi học',restore:'Khôi phục buổi học',makeup:'Tạo buổi học bù'}[mode];
 return <Modal open title={title+' · '+session.classCode} width={680} onOk={()=>form.submit()} onCancel={()=>{if(!busy)onClose();}} okText="Lưu thay đổi" cancelText="Hủy" confirmLoading={busy} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}} okButtonProps={{disabled:details&&(options.loading||!!options.error)}}>
  <Alert type="info" showIcon title="Thay đổi riêng buổi này" description="Buổi đã điểm danh không được đổi ngày/giờ/phòng/giáo viên. Giáo viên thay phải được phân công tại chi nhánh của lớp. Hệ thống kiểm tra trùng lịch thực tế khi lưu." style={{marginBottom:16}}/>
  {error&&<Alert type="error" showIcon title={error} description="Nếu dữ liệu đã thay đổi, đóng biểu mẫu và tải lại buổi học trước khi thực hiện tiếp." style={{marginBottom:16}}/>}
  {options.error&&<Alert type="error" title={options.error}/>}<Form form={form} layout="vertical" onFinish={save} disabled={busy} initialValues={{sessionDate:mode==='makeup'?undefined:dayjs(session.sessionDate),startTime:session.startTime?dayjs('2000-01-01T'+session.startTime):undefined,endTime:session.endTime?dayjs('2000-01-01T'+session.endTime):undefined,roomId:session.roomId??undefined,teacherId:session.teacherId??undefined}}>
   {details&&<><Form.Item name="sessionDate" label={mode==='makeup'?'Ngày học bù':'Ngày học'} rules={[{required:true,message:'Chọn ngày học.'}]}><DatePicker aria-label="Ngày buổi học" format="DD/MM/YYYY" needConfirm={false}/></Form.Item>
    <Space wrap><Form.Item name="startTime" label="Bắt đầu" rules={[{required:true,message:'Chọn giờ bắt đầu.'}]}><TimePicker aria-label="Giờ bắt đầu buổi" needConfirm={false} format="HH:mm"/></Form.Item><Form.Item name="endTime" label="Kết thúc" rules={[{required:true,message:'Chọn giờ kết thúc.'}]}><TimePicker aria-label="Giờ kết thúc buổi" needConfirm={false} format="HH:mm"/></Form.Item></Space>
    <Form.Item name="roomId" label="Phòng thực tế" rules={[{required:true,message:'Chọn phòng.'}]}><Select aria-label="Phòng thực tế" showSearch optionFilterProp="label" options={options.data?.rooms.map(r=>({value:r.id,label:r.code+' · '+r.name,disabled:r.status==='MAINTENANCE'}))}/></Form.Item>
    <Form.Item name="teacherId" label="Giáo viên thực tế" rules={[{required:true,message:'Chọn giáo viên.'}]}><Select aria-label="Giáo viên thực tế" showSearch optionFilterProp="label" options={options.data?.teachers.map(t=>({value:t.profileId,label:t.fullName}))}/></Form.Item></>}
   <Form.Item name="reason" label="Lý do" rules={[{required:true,whitespace:true,message:'Nhập lý do.'},{min:3,max:500}]}><Input.TextArea aria-label="Lý do thay đổi buổi" rows={3} maxLength={500}/></Form.Item>
  </Form>
 </Modal>;
}
