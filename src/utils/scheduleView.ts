import type { SessionStatus } from '../types/session';
export type CalendarView = 'week' | 'day';
export function shiftScheduleDate(date: string, days: number): string {
  const value = new Date(date + 'T00:00:00Z'); value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function dateOr(value: string | null, fallback: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? value : fallback;
}
function id(value: string | null): number | undefined {
  const number = Number(value); return /^[1-9]\d*$/.test(value ?? '') && Number.isSafeInteger(number) ? number : undefined;
}
export function scheduleRange(date: string, view: CalendarView) {
  if (view === 'day') return { from: date, to: date };
  const weekday = new Date(date + 'T00:00:00Z').getUTCDay();
  const from = shiftScheduleDate(date, -((weekday + 6) % 7));
  return { from, to: shiftScheduleDate(from, 6) };
}
export function readScheduleState(params: URLSearchParams, today: string, defaultView: CalendarView = 'week') {
  const listDate = (key: string, fallback: string) => params.get(key) === '' ? undefined : dateOr(params.get(key), fallback);
  const status = params.get('status');
  const page = Number(params.get('page') ?? 0);
  const size = Number(params.get('size') ?? 10);
  return {
    display: params.get('display') === 'list' ? 'list' as const : 'calendar' as const,
    calendarView: params.get('calendarView') === 'day' ? 'day' as const : params.get('calendarView') === 'week' ? 'week' as const : defaultView,
    date: dateOr(params.get('date'), today),
    roomId: id(params.get('roomId')),
    query: {
      page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
      size: [10, 20, 50, 100].includes(size) ? size : 10,
      ...(params.get('allAssigned')==='true'?{allAssigned:true}:{}),
      branchId: id(params.get('branchId')), classId: id(params.get('classId')), teacherId: id(params.get('teacherId')),
      status: ['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status ?? '') ? status as SessionStatus : undefined,
      from: listDate('from', shiftScheduleDate(today, -7)), to: listDate('to', shiftScheduleDate(today, 30)),
    },
  };
}
export function updateScheduleParams(previous: URLSearchParams, patch: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const next = new URLSearchParams(previous);
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) next.delete(key); else next.set(key, String(value));
  }
  return next;
}
