import { api } from '../api/axiosInstance';
import type { PageResponse } from '../types/api';
import type { CourseDto, CourseQuery, CourseRequest, CourseState, RoomDto, RoomQuery, RoomRequest, RoomState,
  ClassDto, ClassQuery, ClassRequest, ClassProgress, ClassDetail, ClassStudent,
  ScheduleDto, ScheduleQuery, ScheduleRequest, ConflictRequest, ScheduleConflict } from '../types/academic';

export async function collectPages<T>(load: (page: number) => Promise<PageResponse<T>>, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  for (let page = 0; ; page++) {
    signal?.throwIfAborted();
    const data = await load(page);
    items.push(...data.content);
    if (page + 1 >= data.totalPages) return items;
  }
}
const root = '/academic';
export const courseService = {
  async detail({id}:{id:number},signal?:AbortSignal):Promise<CourseDto>{return(await api.get<CourseDto>(root+'/courses/'+id,{signal})).data;},
  async list(params: CourseQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<CourseDto>>(root + '/courses', { params, signal })).data;
  },
  async all(params: { branchId?: number }, signal?: AbortSignal) {
    return collectPages((page) => courseService.list({ ...params, page, size: 200 }, signal), signal);
  },
  async save(id: number | null, data: CourseRequest) {
    return id === null ? (await api.post<CourseDto>(root + '/courses', data)).data
      : (await api.put<CourseDto>(root + '/courses/' + id, data)).data;
  },
  async status(id: number, status: CourseState) {
    return (await api.patch<CourseDto>(root + '/courses/' + id + '/status', { status })).data;
  },
};
export const roomService = {
  async list(params: RoomQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<RoomDto>>(root + '/rooms', { params, signal })).data;
  },
  async all(params: { branchId?: number }, signal?: AbortSignal) {
    return collectPages((page) => roomService.list({ ...params, page, size: 200 }, signal), signal);
  },
  async save(id: number | null, data: RoomRequest) {
    return id === null ? (await api.post<RoomDto>(root + '/rooms', data)).data
      : (await api.put<RoomDto>(root + '/rooms/' + id, data)).data;
  },
  async status(id: number, status: RoomState) {
    return (await api.patch<RoomDto>(root + '/rooms/' + id + '/status', { status })).data;
  },
  async remove(id: number) { await api.delete(root + '/rooms/' + id); },
};
export const classService = {
  async list(params: ClassQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<ClassDto>>(root + '/classes', { params, signal })).data;
  },
  async all(params: { branchId?: number }, signal?: AbortSignal) {
    return collectPages((page) => classService.list({ ...params, page, size: 200 }, signal), signal);
  },
  async detail({ id }: { id: number | null }, signal?: AbortSignal): Promise<ClassDetail | null> {
    return id === null ? null : (await api.get<ClassDetail>(root + '/classes/' + id, { signal })).data;
  },
  async students({ id }: { id: number | null }, signal?: AbortSignal): Promise<ClassStudent[]> {
    return id === null ? [] : (await api.get<ClassStudent[]>(root + '/classes/' + id + '/students', { signal })).data;
  },
  async save(id: number | null, data: ClassRequest) {
    // PUT intentionally never sends schedules. Timetable mutations have their own endpoints.
    if (id !== null) { const { schedules: _slots, ...payload } = data; void _slots;
      return (await api.put<ClassDto>(root + '/classes/' + id, payload)).data; }
    return (await api.post<ClassDto>(root + '/classes', data)).data;
  },
  async status(id: number, status: ClassProgress) {
    return (await api.patch<ClassDto>(root + '/classes/' + id + '/status', { status })).data;
  },
  async remove(id: number) { await api.delete(root + '/classes/' + id); },
};
export const scheduleService = {
  async list(params: ScheduleQuery, signal?: AbortSignal) {
    return (await api.get<PageResponse<ScheduleDto>>(root + '/schedules', { params, signal })).data;
  },
  async save(id: number | null, data: ScheduleRequest) {
    return id === null ? (await api.post<ScheduleDto>(root + '/schedules', data)).data
      : (await api.put<ScheduleDto>(root + '/schedules/' + id, data)).data;
  },
  async check(data: ConflictRequest) {
    return (await api.post<ScheduleConflict[]>(root + '/schedules/check-conflict', data)).data;
  },
  async remove(id: number) { await api.delete(root + '/schedules/' + id); },
};
