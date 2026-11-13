import {useListQuery} from '../../hooks/useListQuery';
import TableActions from '../../components/Common/TableActions';
import {useEffect,useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, Button, Card, Checkbox, Descriptions, Drawer, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Eye, Pencil, Plus, RefreshCw, UserCheck, PhoneCall } from 'lucide-react';
import { ManagementLayout, Filters } from '../../components/Layout/ManagementLayout';
import { BranchFilter, LoadError } from '../../components/Common/Academic';
import { LeadTag } from '../../components/Common/Admissions';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { useRemoteResource } from '../../hooks/useRemoteResource';
import { leadService } from '../../services/admissionsService';
import { branchLabel } from '../../utils/academic';
import { LEAD_LABELS, canConvertLead, positiveId } from '../../utils/admissions';
import { displayDate } from '../../utils/display';
import LeadForm from './LeadForm';
import AssignmentModal from './AssignmentModal';
import LeadHistory from './LeadHistory';
import LeadUpdateModal from './LeadUpdateModal';
import ConvertToStudentModal from './ConvertToStudentModal';
import type { LeadDto, LeadQuery } from '../../types/admissions';

export default function LeadsPage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const branches = useBranches();
  const [params, setParams] = useSearchParams();
  const selectedId = positiveId(params.get('leadId')) ?? null;
  const [rawQuery, setQuery] = useListQuery<LeadQuery>(Object.keys(LEAD_LABELS));
  const query={...rawQuery,allAssigned:user?.role==='ADMIN'&&rawQuery.allAssigned?true:undefined,branchId:user?.role==='ADMIN'&&rawQuery.allAssigned?undefined:rawQuery.branchId};
  const list = useRemoteResource(leadService.list, query);
  const detail = useRemoteResource(leadService.detail, { id: selectedId });
  const [search, setSearch] = useState(query.keyword??'');
 useEffect(()=>setSearch(query.keyword??''),[query.keyword]);
  const [formState, setFormState] = useState<{ editing: LeadDto | null } | null>(null);
  const [assignment,setAssignment]=useState<LeadDto|null>(null);
  const manager=user?.role==='SUPER_ADMIN'||user?.role==='ADMIN';
  const canWrite=(lead:LeadDto)=>manager||user?.accountId===lead.assignedTo;
  const [care, setCare] = useState<LeadDto | null>(null);
  const [convert, setConvert] = useState<LeadDto | null>(null);
  function saved(lead: LeadDto, converted = false) {
    setFormState(null); setCare(null);setAssignment(null); setConvert(null);
    list.reload(); detail.reload(); setParams(p=>{const n=new URLSearchParams(p);n.set('leadId',String(lead.id));return n;});
    message.success(converted ? 'Đã chuyển thành học viên. Hãy bổ sung hồ sơ và ghi danh lớp.' : 'Đã lưu thông tin Lead.');
  }
  const actions = (lead: LeadDto) => <TableActions items={[
    ...((canWrite(lead) && lead.status !== 'CONVERTED') ? ([
        {
            key: "action-1", label: "Sửa", icon: <Pencil size={14}/>, onClick: () => setFormState({
                editing: lead
            })
        },
        {
            key: "action-2", label: "Chăm sóc", icon: <PhoneCall size={14}/>, onClick: () => setCare(lead)
        }
    ]) : []), ...((manager && lead.status !== 'CONVERTED') ? ([
        {
            key: "action-3", label: "Phân công", onClick: () => setAssignment(lead)
        }
    ]) : []), ...((canWrite(lead) && canConvertLead(lead.status)) ? ([
        {
            key: "action-4", label: "Chuyển học viên", icon: <UserCheck size={14}/>, onClick: () => setConvert(lead)
        }
    ]) : []), ...((lead.convertedStudent) ? ([
        {
            key: "action-5", label: "Hồ sơ học viên", to: `/students?studentId=${lead.convertedStudent.id}`
        }
    ]) : [])
]}><Button size="small" icon={<Eye size={14}/>} onClick={() => setParams(p=>{const n=new URLSearchParams(p);n.set('leadId',String(lead.id));return n;})}>Xem</Button></TableActions>;
  const columns: TableColumnsType<LeadDto> = [
    { title: 'Khách hàng', key: 'name', width: 230, render: (_, lead) => <div>
      <Button type="link" style={{ padding: 0 }} onClick={() => setParams(p=>{const n=new URLSearchParams(p);n.set('leadId',String(lead.id));return n;})}>{lead.fullName}</Button>
      <div><Typography.Text type="secondary">{lead.phone}</Typography.Text></div></div> },
    { title: 'Khóa quan tâm', dataIndex: 'interestedCourseName', render: (v) => v || '—' },
    { title: 'Nguồn', dataIndex: 'source', render: (v) => v || '—' },
    { title: 'Phụ trách', dataIndex: 'assignedToName' },
    { title: 'Trạng thái', dataIndex: 'status', render: (value) => <LeadTag value={value} /> },
    {title:'Hẹn tiếp theo',key:'next',render:(_,l)=><>{displayDate(l.nextContactAt)}{l.overdue&&<Tag color="red">Quá hẹn</Tag>}</>},
    { title: 'Liên hệ gần nhất', dataIndex: 'lastContactedAt', render: (v) => displayDate(v) },
    ...(user?.role === 'SUPER_ADMIN' ? [{ title: 'Chi nhánh', dataIndex: 'branchId', render: (id: number) => branchLabel(branches.data, id) }] : []),
    { title: 'Thao tác', key: 'actions', fixed: 'right', width: 160, render: (_, lead) => actions(lead) },
  ];
  return <ManagementLayout title="Khách hàng tiềm năng" description="Tiếp nhận, chăm sóc và chuyển đổi Lead thành học viên."
    actions={<><Button icon={<RefreshCw size={16} />} onClick={() => { list.reload(); detail.reload(); }} loading={list.loading}>Tải lại</Button>
      <Button type="primary" icon={<Plus size={16} />} onClick={() => setFormState({ editing: null })}>Thêm Lead</Button></>}>
    <LoadError error={list.error} reload={list.reload} />
    <Card>
      <Filters>
        <Input.Search className="search" placeholder="Tìm tên, điện thoại hoặc email" allowClear enterButton value={search}
          onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setQuery((q) => ({ ...q, keyword: undefined, page: 0 })); }}
          onSearch={(keyword) => setQuery((q) => ({ ...q, keyword: keyword.trim() || undefined, page: 0 }))} />
        <Select className="filter" aria-label="Trạng thái Lead" placeholder="Tất cả trạng thái" allowClear value={query.status}
          options={Object.entries(LEAD_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(status) => setQuery((q) => ({ ...q, status, page: 0 }))} />
        <BranchFilter branches={branches.data} value={query.branchId} loading={branches.loading}
          onChange={(branchId) => setQuery((q) => ({ ...q, branchId, page: 0 }))} />
        <Select aria-label="Lọc lịch chăm sóc" allowClear placeholder="Tất cả lịch hẹn" value={query.followUp} onChange={followUp=>setQuery(q=>({...q,followUp,page:0}))} options={[{value:'OVERDUE',label:'Quá hẹn'},{value:'TODAY',label:'Hẹn hôm nay'},{value:'UPCOMING',label:'Sắp tới'},{value:'UNSCHEDULED',label:'Chưa có lịch hẹn'}]}/>
        <Checkbox checked={!!user && query.assignedTo === user.accountId}
          onChange={(e) => setQuery((q) => ({ ...q, assignedTo: e.target.checked ? user?.accountId : undefined, page: 0 }))}>Lead của tôi</Checkbox>
        <Typography.Text type="secondary">{list.loading?'Đang tải…':list.error?'—':list.data?.totalElements??'—'} Lead</Typography.Text>
      </Filters>
      {!list.error&&<Table<LeadDto> columns={columns} rowKey="id" dataSource={list.data?.content ?? []} loading={list.loading} scroll={{ x: 1350 }}
        locale={{ emptyText: list.error ? 'Chưa tải được dữ liệu' : 'Không có Lead phù hợp' }}
        pagination={{ current: query.page + 1, pageSize: query.size, total: list.data?.totalElements ?? 0, showSizeChanger: true,
          pageSizeOptions: [10, 20, 50], onChange: (page, size) => setQuery((q) => ({ ...q, page: size !== q.size ? 0 : page - 1, size })) }} />}
    </Card>
    <Drawer open={selectedId !== null} onClose={() => setParams(p=>{const n=new URLSearchParams(p);n.delete('leadId');return n;})} title="Thông tin Lead" size={680} loading={detail.loading}>
      <LoadError error={detail.error} reload={detail.reload} />
      {detail.data && <>
        <Space wrap style={{ marginBottom: 20 }}>{actions(detail.data)}</Space>
        <Descriptions bordered column={1} items={[
          {key:'next',label:'Hẹn liên hệ tiếp theo',children:displayDate(detail.data.nextContactAt)},
          { key: 'name', label: 'Họ tên', children: detail.data.fullName },
          { key: 'phone', label: 'Điện thoại', children: detail.data.phone },
          { key: 'email', label: 'Email', children: detail.data.email || '—' },
          { key: 'branch', label: 'Chi nhánh', children: branchLabel(branches.data, detail.data.branchId) },
          { key: 'status', label: 'Trạng thái', children: <LeadTag value={detail.data.status} /> },
          { key: 'source', label: 'Nguồn', children: detail.data.source || '—' },
          { key: 'course', label: 'Khóa quan tâm', children: detail.data.interestedCourseName || '—' },
          { key: 'level', label: 'Trình độ mong muốn', children: detail.data.desiredLevel || '—' },
          { key: 'owner', label: 'Phụ trách', children: detail.data.assignedToName },
          { key: 'created', label: 'Tiếp nhận', children: displayDate(detail.data.createdAt) },
          { key: 'contact', label: 'Liên hệ gần nhất', children: displayDate(detail.data.lastContactedAt) },
          { key: 'notes', label: 'Lịch sử ghi chú', children: <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.data.note || 'Chưa có ghi chú'}</Typography.Paragraph> },
        ]} />
        <LeadHistory id={detail.data.id} version={detail.data.version}/>
      </>}
    </Drawer>
    {formState && <LeadForm editing={formState.editing} defaultBranchId={query.branchId ?? user?.branchId ?? undefined}
      onClose={() => setFormState(null)} onSaved={saved} />}
    {assignment&&<AssignmentModal lead={assignment} onClose={()=>setAssignment(null)} onSaved={saved}/>}
    {care && <LeadUpdateModal lead={care} onClose={() => setCare(null)} onSaved={saved} />}
    {convert && <ConvertToStudentModal lead={convert} onClose={() => setConvert(null)} onSaved={(lead) => saved(lead, true)} />}
  </ManagementLayout>;
}
