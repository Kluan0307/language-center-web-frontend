import {Card,Empty,Progress,Statistic,Tooltip,Typography} from 'antd';
import {Distribution} from './Reports.styles';
export function Metric({title,value,suffix,description,loading=false}:{title:string;value?:number;suffix?:string;description?:string;loading?:boolean}){
 return <Card loading={loading} size="small"><Statistic groupSeparator="." decimalSeparator="," title={title} value={value??'—'} suffix={suffix}/>{description&&<Typography.Paragraph type="secondary" style={{margin:'8px 0 0'}}>{description}</Typography.Paragraph>}</Card>;
}
export function CountDistribution({values,labels}:{values:Record<string,number>;labels:Record<string,string>}){
 const sum=Object.values(values).reduce((a,b)=>a+b,0);
 if(!sum)return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu trong phạm vi này"/>;
 return <Distribution>{Object.entries(values).map(([key,count])=><div className="distribution-row" key={key}>
  <span className="distribution-label">{labels[key]||key}</span><Tooltip title={count+' / '+sum}><Progress percent={count/sum*100} showInfo={false}/></Tooltip><strong>{count}</strong>
 </div>)}</Distribution>;
}
