import { useState } from 'react';
import { Table, Typography } from 'antd';
import { api } from '../../../api/axiosInstance';
import { useRemoteResource } from '../../../hooks/useRemoteResource';
import { LoadError } from '../Academic';
import type { PageResponse } from '../../../types/api';
import { displayDate } from '../../../utils/display';
type Grade = {
    examId: number;
    examName: string;
    examDate: string;
    maxScore: number;
    score: number | null;
    status: string;
    studentComment: string | null;
    publishedAt: string;
};
async function load({ studentId, enrollmentId, page }: {
    studentId: number;
    enrollmentId: number;
    page: number;
}, signal?: AbortSignal) { return (await api.get<PageResponse<Grade>>('/teaching/students/' + studentId + '/enrollments/' + enrollmentId + '/published-grades', { params: { page, size: 5 }, signal })).data; }
export default function PublishedStudentGrades({ studentId, enrollmentId }: {
    studentId: number;
    enrollmentId: number;
}) { const [page, setPage] = useState(0); const data = useRemoteResource(load, { studentId, enrollmentId, page }); return <section><Typography.Title level={5}>Điểm đã công bố</Typography.Title><LoadError error={data.error} reload={data.reload}/>{!data.error && <Table size="small" rowKey="examId" loading={data.loading} dataSource={data.data?.content ?? []} locale={{ emptyText: 'Chưa có điểm được công bố' }} scroll={{ x: 600 }} pagination={{ current: page + 1, pageSize: 5, total: data.data?.totalElements, showSizeChanger: false, onChange: p => setPage(p - 1) }} columns={[{ title: 'Bài kiểm tra', dataIndex: 'examName' }, { title: 'Ngày kiểm tra', dataIndex: 'examDate', render: (v: string) => displayDate(v, false) }, { title: 'Điểm', render: (_, g) => g.score === null ? 'Chưa có điểm' : g.score + ' / ' + g.maxScore }, { title: 'Nhận xét cho học viên', dataIndex: 'studentComment', render: v => v ?? '—' }]}/>}</section>; }
