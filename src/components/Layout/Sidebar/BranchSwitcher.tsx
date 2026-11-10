import { App, Select, Typography } from 'antd';
import {useAuth} from '../../../hooks/useAuth';
import {useBranches} from '../../../hooks/useBranches';
import {useLocation,useNavigate} from 'react-router-dom';
import {selectBranch} from '../../../utils/branchScope';
export default function BranchSwitcher(){
 const location=useLocation();const navigate=useNavigate();
 const {user}=useAuth();const branches=useBranches();const {modal}=App.useApp();
 if(!user||user.role==='SUPER_ADMIN')return null;
 return <div style={{padding:'0 16px 12px'}}><Typography.Text type="secondary">Chi nhánh đang làm việc</Typography.Text>
  <Select aria-label="Chi nhánh đang làm việc" style={{width:'100%',marginTop:6}} value={user.branchId??undefined} loading={branches.loading}
   disabled={(user.branchIds?.length??1)<2} options={branches.data?.map(b=>({value:b.id,label:b.code+' · '+b.name+(b.status==='INACTIVE'?' (Ngừng)':'')}))}
   onChange={(id:number)=>{if(id===user.branchId)return;modal.confirm({title:'Chuyển chi nhánh làm việc?',content:'Trang hiện tại sẽ được tải lại theo chi nhánh đã chọn. Dữ liệu trong biểu mẫu chưa lưu sẽ mất.',okText:'Chuyển chi nhánh',cancelText:'Ở lại',onOk:()=>{navigate(location.pathname,{replace:true});selectBranch(id);}});}}/>
  {branches.error&&<Typography.Text type="danger">Không tải được danh sách chi nhánh.</Typography.Text>}
 </div>;
}
