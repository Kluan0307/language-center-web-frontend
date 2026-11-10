import {Button,Card,Space,Table,Typography} from 'antd';
import {CountDistribution,Metric} from '../../components/Common/Reports';
import {MetricGrid,TwoColumns} from '../../components/Common/Reports/Reports.styles';
import {STUDENT_LABELS,LEAD_LABELS} from '../../utils/admissions';
import {PROGRESS} from '../../utils/academic';
import {exportCsv,totalCounts} from '../../utils/reports';
import type {AcademicReport} from '../../types/reports';
export default function AcademicPanel({report,scope}:{report:AcademicReport;scope:string}){
 const v=report.overall;
 function download(){exportCsv('bao-cao-van-hanh.csv',[
  ['Phạm vi',scope],['Loại số liệu','Hiện trạng tại thời điểm tải báo cáo'],['Chỉ số','Giá trị'],
  ['Học viên đăng ký trong tháng hiện tại',v.newStudentsThisMonth],['Lấp đầy lớp chưa kết thúc (%)',v.classOccupancyRate],['Chuyển đổi Lead (%)',v.leadConversionRate],
  ...Object.entries(v.studentsByStatus).map(([key,value])=>['Học viên: '+(STUDENT_LABELS[key as keyof typeof STUDENT_LABELS]||key),value]),
  ...Object.entries(v.classesByStatus).map(([key,value])=>['Lớp: '+(PROGRESS[key as keyof typeof PROGRESS]||key),value]),
  ...Object.entries(v.leadsByStatus).map(([key,value])=>['Lead: '+(LEAD_LABELS[key as keyof typeof LEAD_LABELS]||key),value]),
  ...Object.entries(v.studentsByLevel).map(([key,value])=>['Trình độ: '+(key==='UNSPECIFIED'?'Chưa xác định':key),value]),
  [],['Chi nhánh','Học viên đang học','Lớp đang diễn ra','Lead','Lấp đầy (%)','Chuyển đổi (%)'],
  ...report.branches.map(b=>[b.branchName||'#'+b.branchId,b.studentsByStatus.STUDYING??0,b.classesByStatus.ONGOING??0,totalCounts(b.leadsByStatus)??0,b.classOccupancyRate,b.leadConversionRate]),
 ]);}
 return <Space orientation="vertical" size={20} style={{width:'100%'}}>
  <Space wrap><Typography.Text strong>{scope}</Typography.Text><Button onClick={download}>Tải CSV vận hành</Button></Space>
  <MetricGrid>
   <Metric title="Tổng hồ sơ học viên" value={totalCounts(v.studentsByStatus)}/>
   <Metric title="Học viên mới tháng này" value={v.newStudentsThisMonth} description="Theo ngày tiếp nhận hồ sơ trong tháng hiện tại."/>
   <Metric title="Tỷ lệ lấp đầy" value={v.classOccupancyRate} suffix="%" description="Sĩ số đang học / sức chứa các lớp chưa kết thúc."/>
   <Metric title="Tỷ lệ chuyển đổi Lead" value={v.leadConversionRate} suffix="%" description="Lead đã chuyển đổi / tổng Lead trong phạm vi."/>
  </MetricGrid>
  <TwoColumns>
   <Card title="Học viên theo trạng thái"><CountDistribution values={v.studentsByStatus} labels={STUDENT_LABELS}/></Card>
   <Card title="Lớp theo tiến độ"><CountDistribution values={v.classesByStatus} labels={PROGRESS}/></Card>
   <Card title="Lead theo trạng thái"><CountDistribution values={v.leadsByStatus} labels={LEAD_LABELS}/></Card>
   <Card title="Trình độ học viên"><CountDistribution values={v.studentsByLevel} labels={{UNSPECIFIED:'Chưa xác định'}}/></Card>
  </TwoColumns>
  {!!report.branches.length&&<Card title="So sánh chi nhánh"><Table rowKey="branchId" dataSource={report.branches} scroll={{x:950}} columns={[
   {title:'Chi nhánh',dataIndex:'branchName'},{title:'Đang học',key:'students',render:(_,r)=>r.studentsByStatus.STUDYING??0},
   {title:'Lớp đang diễn ra',key:'classes',render:(_,r)=>r.classesByStatus.ONGOING??0},
   {title:'Lead',key:'leads',render:(_,r)=>totalCounts(r.leadsByStatus)},
   {title:'Lấp đầy',dataIndex:'classOccupancyRate',render:(n:number)=>n+'%'},{title:'Chuyển đổi',dataIndex:'leadConversionRate',render:(n:number)=>n+'%'},
  ]}/></Card>}
  <Typography.Paragraph type="secondary">Các chỉ số vận hành phản ánh hiện trạng; bộ lọc thời gian của tab Tài chính không áp dụng cho phần này. Không lấy trung bình các tỷ lệ chi nhánh để suy ra tỷ lệ toàn hệ thống.</Typography.Paragraph>
 </Space>;
}
