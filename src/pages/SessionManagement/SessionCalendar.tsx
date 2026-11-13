import { useEffect, useRef } from 'react';
import { Button, DatePicker, Empty, Grid, Segmented, Space, Spin, Tag, Typography } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import luxonPlugin from '@fullcalendar/luxon3';
import viLocale from '@fullcalendar/core/locales/vi';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { SESSION_LABELS, isSubstitute } from '../../utils/sessions';
import type { ClassSession } from '../../types/session';
import { scheduleRange, shiftScheduleDate } from '../../utils/scheduleView';
import type { CalendarView } from '../../utils/scheduleView';

const CalendarFrame = styled.div`
  --fc-border-color: #edf0f5;
  --fc-today-bg-color: #f0f6ff;
  --fc-page-bg-color: #fff;
  margin-top: 16px;
  .fc { font-family: inherit; font-size: 13px; }
  .fc .fc-col-header-cell-cushion { padding: 12px 4px; color: #334155; }
  .fc .fc-timegrid-slot { height: 28px; }
  .fc .fc-timegrid-axis-cushion, .fc .fc-timegrid-slot-label-cushion { color: #64748b; }
  .fc .fc-timegrid-event { border-radius: 6px; cursor: pointer; padding: 3px; }
  .fc .fc-event-main { overflow: hidden; }
  .fc .fc-event-main:focus-visible { outline: 2px solid #1677ff; }
  .fc .fc-timegrid-now-indicator-line { border-color: #ff4d4f; }
  .session-cancelled { opacity: .65; }
  .session-cancelled .session-title { text-decoration: line-through; }
`;
const Toolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-top: 8px;
`;
const DetailLine = styled.div`
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 11px; line-height: 1.5;
`;
export default function SessionCalendar({ sessions, loading, error, date, view, onDateChange, onViewChange, onSelect }: {
  sessions: ClassSession[]; loading: boolean; error?: string; date: string; view: CalendarView;
  onDateChange: (date: string) => void; onViewChange: (view: CalendarView) => void; onSelect: (id: number) => void;
}) {
  const calendar = useRef<FullCalendar>(null);
  const screens = Grid.useBreakpoint();
  const fullView = view === 'day' ? 'timeGridDay' : 'timeGridWeek';
  const range = scheduleRange(date, view);
  const title = view === 'day' ? dayjs(date).format('DD/MM/YYYY') : dayjs(range.from).format('DD/MM') + ' – ' + dayjs(range.to).format('DD/MM/YYYY');
  useEffect(() => {
    const api = calendar.current?.getApi();
    if (api?.view.type !== fullView) api?.changeView(fullView, date);
    else api.gotoDate(date);
  }, [date, fullView]);
  useEffect(() => {
    const timed = sessions.filter(s => s.startTime && s.endTime && s.startTime < s.endTime);
    const active = timed.filter(s => s.status !== 'CANCELLED');
    const starts = (active.length ? active : timed).map(s => s.startTime!);
    const first = starts.sort()[0];
    const minutes = first ? Math.max(0, Number(first.slice(0, 2)) * 60 + Number(first.slice(3, 5)) - 30) : 420;
    const clock = String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0') + ':00';
    const frame = requestAnimationFrame(() => calendar.current?.getApi().scrollToTime(clock));
    return () => cancelAnimationFrame(frame);
  }, [sessions, date, view]);
  const colors = { SCHEDULED: '#1677ff', COMPLETED: '#389e0d', CANCELLED: '#8c8c8c' };
  const events = sessions.map(s => {
    const hasTime = !!s.startTime && !!s.endTime && s.startTime < s.endTime;
    return { id: String(s.id), title: s.className, start: s.sessionDate + (hasTime ? 'T' + s.startTime : ''),
      end: hasTime ? s.sessionDate + 'T' + s.endTime : undefined, allDay: !hasTime,
      backgroundColor: colors[s.status], borderColor: colors[s.status],
      classNames: s.status === 'CANCELLED' ? ['session-cancelled'] : [], extendedProps: { session: s } };
  });
  const timed = sessions.filter(s => s.startTime && s.endTime && s.startTime < s.endTime);
  const minHour = Math.min(7, ...timed.map(s => Number(s.startTime!.slice(0, 2))));
  const maxHour = Math.min(24, Math.max(22, ...timed.map(s => Number(s.endTime!.slice(0, 2)) + 1)));
  return <>
    <Toolbar>
      <Space wrap>
        <Button onClick={() => onDateChange(new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Ho_Chi_Minh'}).format(new Date()))}>Hôm nay</Button>
        <Button icon={<ChevronLeft size={16} />} aria-label="Khoảng trước" onClick={() => onDateChange(shiftScheduleDate(date, view === 'day' ? -1 : -7))} />
        <Button icon={<ChevronRight size={16} />} aria-label="Khoảng sau" onClick={() => onDateChange(shiftScheduleDate(date, view === 'day' ? 1 : 7))} />
        <DatePicker aria-label="Chọn ngày xem lịch" allowClear={false} value={dayjs(date)} format="DD/MM/YYYY" onChange={d => { if (d) onDateChange(d.format('YYYY-MM-DD')); }} />
        {view === 'week' && <Typography.Text strong>{title}</Typography.Text>}
      </Space>
      <Segmented aria-label="Chế độ lịch" value={view} options={[{ label: 'Tuần', value: 'week' }, { label: 'Ngày', value: 'day' }]}
        onChange={onViewChange} />
    </Toolbar>
    <Space wrap style={{ marginBottom: 12 }}>
      <Tag color="blue">Đã xếp lịch</Tag><Tag color="green">Đã hoàn tất</Tag><Tag>Đã hủy</Tag><Tag color="cyan">Học bù</Tag><Tag color="orange">Dạy thay</Tag><Typography.Text type="secondary">Giờ Việt Nam (UTC+7)</Typography.Text>
      <Typography.Text type="secondary">{loading ? 'Đang tải…' : error ? 'Chưa tải được lịch' : `${sessions.length} buổi`}</Typography.Text>
    </Space>
    <Spin spinning={loading}>
      <CalendarFrame>
        <FullCalendar ref={calendar} plugins={[timeGridPlugin, luxonPlugin]} locale={viLocale}
          timeZone="Asia/Ho_Chi_Minh" initialDate={date} initialView={fullView}
          firstDay={1} headerToolbar={false} height={screens.md ? 700 : 600} nowIndicator
          allDayText="Chưa có giờ" allDaySlot={sessions.some(s => !s.startTime || !s.endTime || s.startTime >= s.endTime)}
          slotMinTime={String(minHour).padStart(2, '0') + ':00:00'} slotMaxTime={String(maxHour).padStart(2, '0') + ':00:00'}
          slotDuration="00:30:00" scrollTime="07:00:00" weekends slotEventOverlap={false}
          editable={false} eventStartEditable={false} eventDurationEditable={false}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
          events={error ? [] : events} eventClick={info => onSelect(Number(info.event.id))}
          eventDidMount={info=>{info.el.tabIndex=0;info.el.setAttribute('role','button');info.el.setAttribute('aria-label','Mở buổi '+info.event.title+' '+info.event.startStr);info.el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(Number(info.event.id));}};}}
          eventContent={info => {
            const s = info.event.extendedProps.session as import('../../types/session').ClassSession;
            return <div title={[info.timeText, s.className, s.roomName, s.teacherName, SESSION_LABELS[s.status]].filter(Boolean).join(' · ')}>
              <DetailLine>{info.timeText || 'Chưa xác định giờ'}</DetailLine>
              <strong className="session-title">{s.kind==='MAKEUP'?'Bù · ':isSubstitute(s)?'Dạy thay · ':''}{s.className}</strong>
              <DetailLine>{s.roomName || 'Chưa có phòng'}</DetailLine>
              <DetailLine>{s.teacherName || 'Chưa phân công'}</DetailLine>
              {s.kind === 'MAKEUP' && <DetailLine>Học bù</DetailLine>}
              {isSubstitute(s) && <DetailLine>Dạy thay</DetailLine>}
              {s.status === 'CANCELLED' && <DetailLine>Đã hủy</DetailLine>}
            </div>;
          }} />
      </CalendarFrame>
      {!loading && !error && sessions.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có buổi học trong khoảng này" />}
    </Spin>

  </>;
}
