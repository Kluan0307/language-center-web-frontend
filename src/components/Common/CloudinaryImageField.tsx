import CloudinaryLibrary from './CloudinaryLibrary';
import {useEffect,useRef,useState} from 'react';
import {Alert,App,Button,Image,Input,Typography,Upload} from 'antd';
import styled from 'styled-components';
import {UploadCloud,ImageOff} from 'lucide-react';
import {api} from '../../api/axiosInstance';
import {getErrorMessage} from '../../utils/apiErrors';
type Props={value?:string;onChange?:(value:string)=>void;category:string;branchId?:number|null;disabled?:boolean;isRetained?:(url:string)=>boolean;onBusyChange?:(busy:boolean)=>void};
const Wrap=styled.div({display:'grid',gap:12,'.image-preview':{maxWidth:320,borderRadius:12,overflow:'hidden',border:'1px solid #e5e7eb'},'.upload-actions':{display:'flex',flexWrap:'wrap',gap:8}});
export default function CloudinaryImageField({value,onChange,category,branchId,disabled,onBusyChange,isRetained}:Props){
 const {message}=App.useApp(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[manual,setManual]=useState(false),[library,setLibrary]=useState(false);
 const pending=useRef(new Map<number,string>()),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;for(const [id,url] of pending.current)if(!isRetained?.(url))void api.delete('/academic/media/images/'+id).catch(()=>{/* Saved/history images are retained by the server. */});};},[]);
 async function upload(file:File){
  if(!['image/jpeg','image/png'].includes(file.type)){message.error('Chỉ hỗ trợ ảnh JPEG hoặc PNG.');return;}
  if(file.size>5*1024*1024){message.error('Ảnh tối đa 5 MB.');return;}
  setBusy(true);onBusyChange?.(true);setError('');
  try{const body=new FormData();body.set('file',file);body.set('category',category);if(branchId!=null)body.set('branchId',String(branchId));
   const r=await api.post<{id:number;url:string}>('/academic/media/images',body,{headers:{'Content-Type':undefined},timeout:35000});
   if(!alive.current){void api.delete('/academic/media/images/'+r.data.id).catch(()=>{});return;}
   pending.current.set(r.data.id,r.data.url);onChange?.(r.data.url);message.success('Đã tải ảnh. Nhấn Lưu để áp dụng.');
  }catch(e){if(alive.current)setError(getErrorMessage(e));}finally{if(alive.current)setBusy(false);onBusyChange?.(false);}
 }
 return <Wrap>{value&&<div className="image-preview"><Image src={value} alt="Ảnh nội dung" width="100%" style={{maxHeight:210,objectFit:'cover'}}/></div>}
  {error&&<Alert showIcon type="error" title={error}/>}
  <CloudinaryLibrary open={library} category={category} branchId={branchId} onClose={()=>setLibrary(false)} onSelect={url=>onChange?.(url)} onDeleted={url=>{if(value===url)onChange?.('');}}/><div className="upload-actions"><Button disabled={disabled||busy} onClick={()=>setLibrary(true)}>Thư viện ảnh</Button><Upload accept="image/jpeg,image/png" showUploadList={false} disabled={disabled||busy} beforeUpload={file=>{void upload(file);return false;}}><Button loading={busy} disabled={disabled||busy} icon={<UploadCloud size={16}/>}>{value?'Thay ảnh':'Tải ảnh lên'}</Button></Upload>
  {value&&<Button disabled={disabled||busy} icon={<ImageOff size={16}/>} onClick={()=>onChange?.('')}>Gỡ ảnh</Button>}
  <Button type="link" disabled={disabled||busy} onClick={()=>setManual(v=>!v)}>Dùng URL có sẵn</Button></div>
  {manual&&<Input disabled={disabled||busy} value={value} onChange={e=>onChange?.(e.target.value)} maxLength={1000} placeholder="https://..."/>}
  <Typography.Text type="secondary">JPEG/PNG, tối đa 5 MB. Ảnh sẽ hiển thị sau khi lưu nội dung đã xuất bản.</Typography.Text>
 </Wrap>;
}
