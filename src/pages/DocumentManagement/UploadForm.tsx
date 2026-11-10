import {useState} from 'react';
import {useFormLeaveGuard} from '../../hooks/useFormLeaveGuard';
import axios from 'axios';
import {Alert,Button,Form,Input,Modal,Radio,Select,Upload,Typography} from 'antd';
import {BranchField,LoadError} from '../../components/Common/Academic';
import {useAuth} from '../../hooks/useAuth';
import {useBranches} from '../../hooks/useBranches';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {classService,courseService} from '../../services/academicService';
import {documentService} from '../../services/teachingService';
import {FILE_EXTENSIONS,validateDocumentFile} from '../../utils/teaching';
import {getErrorMessage} from '../../utils/apiErrors';
import type {DocumentDto} from '../../types/teaching';
async function options({branchId,teacher}:{branchId:number|null;teacher:boolean},signal?:AbortSignal){
 if(!branchId)return {classes:[],courses:[]};
 const classes=await classService.all({branchId},signal);
 const courses=teacher?[...new Map(classes.map(c=>[c.courseId,{id:c.courseId,code:'',name:c.courseName}])).values()]:await courseService.all({branchId},signal);
 return {classes,courses};
}
interface Values{branchId?:number;target:'class'|'course';classId?:number;courseId?:number;title:string;description?:string}
export default function UploadForm({defaultBranchId,onClose,onSaved}:{defaultBranchId?:number;onClose:()=>void;onSaved:(d:DocumentDto)=>void}){
 const {user}=useAuth();const branches=useBranches();const [form]=Form.useForm<Values>();
 const chosen=Form.useWatch('branchId',form) as number|undefined;const target=Form.useWatch('target',form) as Values['target']|undefined;
 const branchId=(user?.role==='SUPER_ADMIN'?chosen:user?.branchId)??null;
 const data=useRemoteResource(options,{branchId,teacher:user?.role==='TEACHER'});
 const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState<string>();const [uncertain,setUncertain]=useState(false);
 const guard=useFormLeaveGuard(busy,onClose);
 async function save(v:Values){if(busy||uncertain)return;setError(undefined);
  try{if(!file)throw new Error('Chọn file tài liệu.');validateDocumentFile(file);
   const body=new FormData();body.append('title',v.title.trim());if(v.description?.trim())body.append('description',v.description.trim());
   if(v.target==='class')body.append('classId',String(v.classId));else{body.append('courseId',String(v.courseId));body.append('branchId',String(branchId));}body.append('file',file);
   setBusy(true);onSaved(await documentService.upload(body));
  }catch(e){setError(getErrorMessage(e));if(axios.isAxiosError(e)&&(!e.response||e.response.status>=500))setUncertain(true);}
  finally{setBusy(false);}
 }
 return <Modal open title="Tải tài liệu lên" width={720} okText="Tải lên" cancelText={uncertain?'Đóng để kiểm tra danh sách':'Hủy'} confirmLoading={busy} onOk={()=>form.submit()}
  okButtonProps={{disabled:uncertain||data.loading||!!data.error||!file}} onCancel={guard.cancel} closable={!busy} maskClosable={!busy} cancelButtonProps={{disabled:busy}}>
  {error&&<Alert type={uncertain?'warning':'error'} showIcon title={error} style={{marginBottom:16}}/>}
  {uncertain&&<Alert showIcon type="warning" title="Chưa xác nhận kết quả tải lên" description="Đóng cửa sổ và tải lại danh sách để kiểm tra tài liệu đã được lưu hay chưa trước khi tải lại file." style={{marginBottom:16}}/>}
  <LoadError error={branches.error} reload={branches.reload}/><LoadError error={data.error} reload={data.reload}/>
  <Form form={form} layout="vertical" initialValues={{branchId:defaultBranchId,target:'class'}} disabled={busy||uncertain} onFinish={save}
   onValuesChange={changed=>{guard.changed();if('branchId' in changed||'target' in changed)form.setFieldsValue({classId:undefined,courseId:undefined});}}>
   <BranchField branches={branches.data} loading={branches.loading}/>
   <Form.Item name="target" label="Gắn tài liệu với"><Radio.Group options={[{value:'class',label:'Một lớp'},{value:'course',label:'Một khóa học'}]}/></Form.Item>
   {target==='course'?<Form.Item name="courseId" label="Khóa học" rules={[{required:true,message:'Chọn khóa.'}]}><Select disabled={!branchId} showSearch optionFilterProp="label" loading={data.loading} options={data.data?.courses.map(c=>({value:c.id,label:(c.code?c.code+' · ':'')+c.name}))}/></Form.Item>
    :<Form.Item name="classId" label="Lớp" rules={[{required:true,message:'Chọn lớp.'}]}><Select disabled={!branchId} showSearch optionFilterProp="label" loading={data.loading} options={data.data?.classes.map(c=>({value:c.id,label:c.code+' · '+c.name}))}/></Form.Item>}
   <Form.Item name="title" label="Tiêu đề" rules={[{required:true,whitespace:true},{max:255}]}><Input maxLength={255}/></Form.Item>
   <Form.Item name="description" label="Mô tả" rules={[{max:1000}]}><Input.TextArea rows={3} maxLength={1000}/></Form.Item>
   <Form.Item label="File" required extra="PDF, Word, Excel, PowerPoint, ảnh hoặc TXT. Tối đa 10 MB.">
    <Upload maxCount={1} accept={FILE_EXTENSIONS.map(e=>'.'+e).join(',')} disabled={busy||uncertain}
     fileList={file?[{uid:'selected',name:file.name,status:'done'}]:[]}
     beforeUpload={next=>{try{validateDocumentFile(next);setFile(next);guard.changed();setError(undefined);}catch(e){setError(getErrorMessage(e));}return false;}} onRemove={()=>{guard.changed();setFile(null);return true;}}>
     <Button disabled={busy||uncertain}>Chọn file</Button>
    </Upload>
   </Form.Item>
  </Form>
  <Typography.Paragraph type="secondary">Tài liệu mới ở trạng thái Chờ duyệt. Teacher chỉ chọn lớp/khóa được phân công; Staff chỉ thấy tài liệu đã duyệt.</Typography.Paragraph>
 </Modal>;
}
