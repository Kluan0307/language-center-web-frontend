import {displayDate} from '../../utils/display';
import {useAuth} from '../../hooks/useAuth';
import {managementCourses} from '../../services/managementOptions';
import {Alert,Button,Card,DatePicker,Empty,Progress,Space,Table,Typography} from 'antd';
import dayjs from 'dayjs';
import ReconciliationPanel from './ReconciliationPanel';
import {Metric} from '../../components/Common/Reports';
import {MetricGrid,TwoColumns} from '../../components/Common/Reports/Reports.styles';
import {LoadError} from '../../components/Common/Academic';
import {useRemoteResource} from '../../hooks/useRemoteResource';

import {reportService} from '../../services/reportService';
import {money} from '../../utils/academic';
import {exportCsv,orderedMonths} from '../../utils/reports';
import type {Branch} from '../../types/branch';
import type {RevenueQuery} from '../../types/reports';
async function load({query,valid}:{query:RevenueQuery;valid:boolean;revision?:number},signal?:AbortSignal){return valid?reportService.revenue(query,signal):null;}
export default function RevenuePanel({allAssigned=false,branchId,branches,scope,from,to,onRange,revision}:{allAssigned?:boolean;branchId?:number;branches?:Branch[];scope:string;from?:string;to?:string;onRange:(from?:string,to?:string)=>void;revision:number}){
 const valid=!from||!to||from<=to;
 const report=useRemoteResource(load,{query:{branchId,from,to,allAssigned},valid,revision});
 const {user}=useAuth();const courses=useRemoteResource(managementCourses,{branchId,allAssigned,branchIds:user?.branchIds});
 const months=orderedMonths(report.data?.byMonth??[]);
 const max=Math.max(0,...months.map(r=>Math.abs(r.amount)));
 const courseName=(key:string)=>key==='null'?'Chưa gắn khóa':courses.data?.find(c=>String(c.id)===key)?.name||'Khóa #'+key;
 const branchName=(key:string)=>branches?.find(b=>String(b.id)===key)?.name||'Chi nhánh #'+key;
 function download(){const r=report.data;if(!r)return;exportCsv('bao-cao-tai-chinh.csv',[
  ['Phạm vi',scope],['Thu từ ngày',from||'Không giới hạn'],['Thu đến hết ngày',to||'Không giới hạn'],
  ['Thu gốc (VND)',r.grossCollected],['Đảo phiếu (VND)',r.voided],['Hoàn tiền (VND)',r.refunded],['Tiền dư hiện tại (VND)',r.credit],['Thu ròng trong khoảng (VND)',r.collected],['Công nợ hiện tại (VND)',r.outstanding],[],['Tháng','Thu ròng (VND)'],
  ...months.map(g=>[g.key,g.amount]),[],['Khóa gốc','Thu ròng (VND)'],...r.byCourse.map(g=>[courseName(g.key),g.amount]),
  [],['Chi nhánh','Thu ròng (VND)'],...r.byBranch.map(g=>[branchName(g.key),g.amount]),
 ]);}
 return <Space orientation="vertical" size={20} style={{width:'100%'}}>
  <Space wrap><DatePicker aria-label="Thu từ ngày" placeholder="Từ ngày thu" format="DD/MM/YYYY" needConfirm={false} value={from?dayjs(from):null} onChange={d=>onRange(d?.format('YYYY-MM-DD'),to)}/>
   <DatePicker aria-label="Thu đến ngày" placeholder="Đến hết ngày" format="DD/MM/YYYY" needConfirm={false} value={to?dayjs(to):null} onChange={d=>onRange(from,d?.format('YYYY-MM-DD'))}/>
   <Button disabled={!report.data||report.loading||!!report.error||!valid} onClick={download}>Tải CSV tài chính</Button></Space>
  {!valid&&<Alert showIcon type="warning" title="Từ ngày không được sau đến ngày"/>}
  <LoadError error={report.error} reload={report.reload}/>{report.data&&report.loadedAt&&<Typography.Text type="secondary">Tải dữ liệu tài chính lúc {displayDate(report.loadedAt)}</Typography.Text>}
  <Alert showIcon type="info" title="Tiền thu theo kỳ, công nợ tại hiện tại" description="Thu ròng = thu gốc − đảo phiếu − hoàn tiền; mỗi giao dịch tính theo ngày phát sinh riêng (tính cả hai ngày đầu/cuối). Công nợ là tổng số còn phải thu hiện tại của học phí chưa hủy, không phải công nợ tại ngày kết thúc kỳ."/>
  <MetricGrid><Metric title="Thu gốc (VND)" value={report.data?.grossCollected} loading={report.loading}/><Metric title="Đảo phiếu (VND)" value={report.data?.voided} loading={report.loading}/><Metric title="Hoàn tiền (VND)" value={report.data?.refunded} loading={report.loading}/><Metric title="Tiền dư hiện tại (VND)" value={report.data?.credit} loading={report.loading}/><Metric title="Thu ròng trong khoảng (VND)" value={report.data?.collected} loading={report.loading}/><Metric title="Công nợ hiện tại (VND)" value={report.data?.outstanding} loading={report.loading}/></MetricGrid>
  <TwoColumns>
   <Card title="Tiền thu theo tháng" loading={report.loading}>
    {!months.length?<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={report.error?'Chưa tải được báo cáo':'Không có khoản thu trong khoảng này'}/>:<Space orientation="vertical" style={{width:'100%'}} size={16}>{months.map(m=><div key={m.key}><Space style={{width:'100%',justifyContent:'space-between'}}><strong>{m.key}</strong><span>{money(m.amount)}</span></Space><Progress percent={max?Math.abs(m.amount)/max*100:0} showInfo={false} aria-label={'Tiền thu tháng '+m.key}/></div>)}</Space>}
   </Card>
   <Card title="Tiền thu theo khóa ghi danh gốc"><LoadError error={courses.error} reload={courses.reload}/><Table rowKey="key" dataSource={report.data?.byCourse??[]} loading={report.loading} columns={[{title:'Khóa',dataIndex:'key',render:courseName},{title:'Thu ròng',dataIndex:'amount',render:money}]}/></Card>
  </TwoColumns>
  <Card title="Tiền thu theo chi nhánh"><Table rowKey="key" dataSource={report.data?.byBranch??[]} loading={report.loading} columns={[{title:'Chi nhánh',dataIndex:'key',render:branchName},{title:'Thu ròng',dataIndex:'amount',render:money}]}/></Card>
  <ReconciliationPanel key={String(branchId)+String(allAssigned)} branchId={branchId} allAssigned={allAssigned} revision={revision}/>
  <Typography.Paragraph type="secondary">Nguồn là phiếu thu đã lưu, không phải giá trị ghi danh. Chuyển lớp cùng khóa giữ khoản thu ở khóa/lớp ghi danh gốc. Các nhóm có dữ liệu mới xuất hiện trên báo cáo.</Typography.Paragraph>
 </Space>;
}
