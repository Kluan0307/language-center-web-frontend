import {useEffect,useRef,useState} from 'react';
import {Alert,App,Button,Card,Image,Modal,Space,Tag,Typography} from 'antd';
import {api} from '../../api/axiosInstance';
import {getErrorMessage} from '../../utils/apiErrors';
type Asset={id:number;url:string;format:string;width:number;height:number;createdAt:string};
type Item={asset:Asset;inUse:boolean;canDelete:boolean};
type Props={open:boolean;category:string;branchId?:number|null;onClose:()=>void;onSelect:(url:string)=>void;onDeleted:(url:string)=>void};
export default function CloudinaryLibrary({open,category,branchId,onClose,onSelect,onDeleted}:Props){
 const {message,modal}=App.useApp(),[items,setItems]=useState<Item[]>([]),[page,setPage]=useState(0),[loading,setLoading]=useState(false),[error,setError]=useState('');const serial=useRef(0);
 async function load(target:number){const current=++serial.current;setLoading(true);setError('');try{const r=await api.get<Item[]>('/academic/media/images',{params:{category,branchId:branchId??undefined,page:target}});if(current===serial.current){setItems(r.data);setPage(target);}}catch(e){if(current===serial.current)setError(getErrorMessage(e));}finally{if(current===serial.current)setLoading(false);}}
 useEffect(()=>{if(open)void load(0);return()=>{serial.current++;};},[open,category,branchId]);
 function remove(item:Item){modal.confirm({title:'Xóa vĩnh viễn ảnh chưa sử dụng?',content:'Ảnh sẽ được xóa khỏi thư viện. Thao tác này không thể hoàn tác.',okText:'Xóa ảnh',cancelText:'Hủy',okButtonProps:{danger:true},onOk:async()=>{try{await api.delete('/academic/media/images/'+item.asset.id);onDeleted(item.asset.url);message.success('Đã xóa ảnh');await load(page);}catch(e){setError(getErrorMessage(e));throw e;}}});}
 return <Modal open={open} title="Thư viện ảnh" width={850} footer={null} onCancel={onClose} destroyOnHidden>
  {error&&<Alert type="error" showIcon title={error}/>}
  <Typography.Paragraph type="secondary">Chọn lại ảnh đã tải lên. Ảnh đang dùng hoặc còn trong lịch sử biên tập sẽ được giữ lại.</Typography.Paragraph>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:16}}>{items.map(item=><Card key={item.asset.id} size="small" cover={<Image src={item.asset.url} alt="Ảnh thư viện" height={130} style={{objectFit:'cover'}}/>}>
   <Space orientation="vertical" style={{width:'100%'}}><Typography.Text>{item.asset.width} × {item.asset.height} · {item.asset.format.toUpperCase()}</Typography.Text><Tag color={item.inUse?'blue':'default'}>{item.inUse?'Đang dùng / lưu lịch sử':'Chưa sử dụng'}</Tag>
   <Space wrap><Button type="primary" disabled={loading} onClick={()=>{onSelect(item.asset.url);onClose();}}>Chọn ảnh</Button><Button danger disabled={!item.canDelete||loading} onClick={()=>remove(item)}>Xóa</Button></Space></Space>
  </Card>)}</div>
  {!loading&&!items.length&&<Typography.Paragraph>Chưa có ảnh phù hợp trong thư viện.</Typography.Paragraph>}
  <Space style={{marginTop:20}}><Button disabled={page===0||loading} onClick={()=>void load(page-1)}>Trang trước</Button><Typography.Text>Trang {page+1}</Typography.Text><Button loading={loading} disabled={items.length<20} onClick={()=>void load(page+1)}>Trang sau</Button><Button disabled={loading} onClick={()=>void load(page)}>Tải lại</Button></Space>
 </Modal>;
}
