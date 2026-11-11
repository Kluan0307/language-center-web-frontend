import { sessionService } from '../../services/sessionService';
import { scheduleRange } from '../../utils/scheduleView';
import type { CalendarView } from '../../utils/scheduleView';
import type { ClassSession, SessionQuery } from '../../types/session';
import type { PageResponse } from '../../types/api';
export interface ScheduleLoad {
  display: 'calendar' | 'list'; date: string; calendarView: CalendarView;
  query: SessionQuery; roomId?: number; revision: number;
}
export interface ScheduleResult extends PageResponse<ClassSession> { options: ClassSession[] }
export async function loadSchedule({ display, date, calendarView, query, roomId }: ScheduleLoad, signal?: AbortSignal): Promise<ScheduleResult> {
  const empty: ScheduleResult = { content: [], options: [], page: query.page, size: query.size, totalElements: 0, totalPages: 0 };
  if (display === 'list' && query.from && query.to && query.from > query.to) return empty;
  if (display === 'list' && !roomId) {
    const result = await sessionService.list(query, signal);
    return { ...result, options: result.content };
  }
  const { page: _page, size: _size, ...filters } = query; void _page; void _size;
  const options = await sessionService.all({ ...filters, ...(display === 'calendar' ? scheduleRange(date, calendarView) : {}) }, signal);
  // Session API has no room filter. Filter the complete authorized range before paginating.
  const matching = roomId ? options.filter(s => s.roomId === roomId) : options;
  return { content: display === 'calendar' ? matching : matching.slice(query.page * query.size, (query.page + 1) * query.size),
    options, page: query.page, size: query.size, totalElements: matching.length, totalPages: Math.ceil(matching.length / query.size) };
}
