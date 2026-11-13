import {ContextLink} from '../../components/Common/ContextLink';
import {Link} from 'react-router-dom';
import {Alert,Button,Card,Space,Table} from 'antd';
import {ManagementLayout} from '../../components/Layout/ManagementLayout';
import {LoadError} from '../../components/Common/Academic';
import {Metric} from '../../components/Common/Reports';
import {MetricGrid} from '../../components/Common/Reports/Reports.styles';
import {useRemoteResource} from '../../hooks/useRemoteResource';
import {classService} from '../../services/academicService';
import {sessionService} from '../../services/sessionService';
import {attendanceLink,isSubstitute} from '../../utils/sessions';
import dayjs from 'dayjs';
import {businessDate} from '../../utils/academic';
import {displayDate} from '../../utils/display';
export default function TeacherDashboard(){
 const classes=useRemoteResource(classService.all,{});
 const today=businessDate();const schedules=useRemoteResource(sessionService.all,{from:today,to:dayjs(today).add(6,'day').format('YYYY-MM-DD')});
 const sessions=schedules.data?.filter(s=>s.status!=='CANCELLED')??[];
 const ready=!!schedules.data;
 const active=classes.data?.filter(c=>c.status!=='FINISHED');
 return <ManagementLayout title="Tổng quan giảng dạy" description="Lớp được phân công và lịch dạy trong 7 ngày, bắt đầu từ hôm nay."
  actions={<Button onClick={()=>{classes.reload();schedules.reload();}}>Tải lại</Button>}>
  <LoadError error={classes.error} reload={classes.reload}/><LoadError error={schedules.error} reload={schedules.reload}/>
  <MetricGrid>
   <Metric title="Lớp phụ trách" value={classes.data?.length} loading={classes.loading}/>
   <Metric title="Lớp đang diễn ra" value={classes.data?.filter(c=>c.status==='ONGOING').length} loading={classes.loading}/>
   <Metric title="Lượt học viên ở lớp chưa kết thúc" value={active?.reduce((sum,c)=>sum+c.currentSize,0)} description="Cộng sĩ số từng lớp, không phải số học viên duy nhất." loading={classes.loading}/>
   <Metric title="Buổi thực tế hôm nay" value={ready?sessions.filter(s=>s.sessionDate===today).length:undefined} loading={schedules.loading}/>
  </MetricGrid>
  <Card title="Lịch dạy trong 7 ngày" extra={<Link to="/my-schedule">Mở lịch dạy</Link>}>
   <Alert type="info" showIcon title="Theo buổi học thực tế" description="Đã áp dụng buổi hủy, học bù và giáo viên dạy thay. Không suy diễn từ lịch tuần." style={{marginBottom:16}}/>
   <Table rowKey="id" dataSource={ready?sessions:[]} loading={schedules.loading} scroll={{x:850}}
    locale={{emptyText:schedules.error?'Chưa tải được lịch dạy':'Không có buổi theo lịch trong khoảng này'}}
    columns={[
     {title:'Ngày',dataIndex:'sessionDate',render:(v:string)=>displayDate(v,false)},
     {title:'Giờ',key:'time',render:(_,r)=>(r.startTime??'Chưa xác minh')+' – '+(r.endTime??'')},
     {title:'Lớp',key:'class',render:(_,r)=>r.className},{title:'Phòng',key:'room',render:(_,r)=>r.roomName},
     {title:'Phân công',key:'assigned',render:(_,r)=>isSubstitute(r)?'Dạy thay':'Phụ trách'},
     {title:'Thao tác',key:'actions',render:(_,r)=><Space wrap>{r.sessionDate>today?<span>Chưa đến ngày điểm danh</span>:<ContextLink to={attendanceLink(r.id)}><Button size="small">{r.canAttend?'Điểm danh':'Xem điểm danh'}</Button></ContextLink>}<ContextLink to={'/my-schedule?sessionId='+r.id+'&date='+r.sessionDate+'&classId='+r.classId}><Button size="small">Chi tiết buổi</Button></ContextLink></Space>},
    ]}/>
  </Card>
  <Card title="Công việc thường dùng"><Space wrap><Link to="/my-classes"><Button>Lớp của tôi</Button></Link><Link to="/exams"><Button>Bài kiểm tra</Button></Link><Link to="/documents"><Button>Tài liệu của tôi</Button></Link></Space>
  </Card>
 </ManagementLayout>;
}
