import { useState } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { BranchField, LoadError } from '../../components/Common/Academic';
import { tuitionService } from '../../services/financeService';
import { collectPages } from '../../services/academicService';
import { canCollect } from '../../utils/finance';
import { money } from '../../utils/academic';
async function load({branchId}:{branchId:number|null},signal?:AbortSignal){
 return !branchId?[]:collectPages(page=>tuitionService.list({branchId,page,size:200},signal),signal);
}
export default function TuitionPicker({defaultBranchId,onClose,onSelected}:{defaultBranchId?:number;onClose:()=>void;onSelected:(id:number)=>void}){
 const {user}=useAuth();const branches=useBranches();const [form]=Form.useForm<{branchId?:number;tuitionId:number}>();
 const watched=Form.useWatch('branchId',form) as number|undefined;
 const branchId=(user?.role==='SUPER_ADMIN'?watched:user?.branchId)??null;
 const options=useRemoteResource(load,{branchId});
 const [selected,setSelected]=useState<number>();
 return <Modal open title="Chọn học phí cần thu" okText="Tiếp tục" cancelText="Hủy" onCancel={onClose} onOk={()=>form.submit()}
  okButtonProps={{disabled:options.loading || !!options.error || !selected}}>
  <LoadError error={branches.error} reload={branches.reload}/><LoadError error={options.error} reload={options.reload}/>
  <Form form={form} layout="vertical" initialValues={{branchId:defaultBranchId}} onFinish={v=>onSelected(v.tuitionId)}
   onValuesChange={changed=>{if('branchId' in changed){form.setFieldValue('tuitionId',undefined);setSelected(undefined);}}}>
   <BranchField branches={branches.data} loading={branches.loading}/>
   <Form.Item name="tuitionId" label="Học phí còn nợ" rules={[{required:true}]}><Select showSearch optionFilterProp="label" disabled={!branchId}
    loading={options.loading} onChange={setSelected} notFoundContent="Không có học phí còn nợ phù hợp"
    options={options.data?.filter(canCollect).map(t=>({value:t.id,label:'#'+t.id+' · '+(t.studentName||'#'+t.studentId)+' · '+(t.className||'#'+t.classId)+' · Còn '+money(t.balance)}))}/></Form.Item>
  </Form>
  <Button type="link" onClick={options.reload}>Tải lại học phí</Button>
 </Modal>;
}
