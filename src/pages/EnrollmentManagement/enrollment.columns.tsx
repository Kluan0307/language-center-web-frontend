import type { ColumnsType } from 'antd/es/table';
import { Pencil, User, Calendar } from 'lucide-react';
import type { Enrollment, StudyStatus } from '../../types';
import * as S from './EnrollmentPage.styles';

export const getStudyStatusLabel = (status: StudyStatus): string => {
    switch (status) {
        case 'STUDYING':
            return 'Đang học';
        case 'DROPPED':
            return 'Đã thôi học';
        case 'COMPLETED':
            return 'Hoàn thành';
        case 'TRANSFERRED':
            return 'Đã chuyển lớp';
        case 'RESERVED':
            return 'Bảo lưu';
        default:
            return status;
    }
};

export const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return dateStr;
    }
};

interface GetEnrollmentColumnsProps {
    onEditStatus: (enrollment: Enrollment) => void;
}

export const getEnrollmentColumns = ({
    onEditStatus,
}: GetEnrollmentColumnsProps): ColumnsType<Enrollment> => [
    {
        title: 'Học viên',
        dataIndex: ['student', 'fullName'],
        key: 'studentName',
        render: (_, record) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <User size={16} />
                </div>
                <div>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>
                        {record.student.fullName}
                    </span>
                </div>
            </div>
        ),
    },
    {
        title: 'Trình độ',
        dataIndex: ['student', 'currentLevel'],
        key: 'currentLevel',
        width: 130,
        render: (level: string) => <S.LevelBadge>{level}</S.LevelBadge>,
    },
    {
        title: 'Lớp học',
        dataIndex: ['schoolClass', 'name'],
        key: 'schoolClass',
        render: (_, record) => (
            <S.ClassBadge>
                <span className="class-name">{record.schoolClass.name}</span>
                <span className="class-code">Mã lớp: {record.schoolClass.code}</span>
            </S.ClassBadge>
        ),
    },
    {
        title: 'Ngày đăng ký',
        dataIndex: 'enrolledAt',
        key: 'enrolledAt',
        width: 140,
        render: (enrolledAt: string) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 13 }}>
                <Calendar size={14} color="#64748B" />
                <span>{formatDate(enrolledAt)}</span>
            </div>
        ),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'studyStatus',
        key: 'studyStatus',
        width: 160,
        render: (status: StudyStatus) => (
            <S.StudyStatusTag $status={status}>
                {getStudyStatusLabel(status)}
            </S.StudyStatusTag>
        ),
    },
    {
        title: 'Thao tác',
        key: 'actions',
        width: 100,
        align: 'center',
        render: (_, record) => (
            <S.ActionButtons onClick={(e) => e.stopPropagation()}>
                <S.ActionButton
                    $variant="edit"
                    title="Cập nhật trạng thái"
                    type="button"
                    onClick={() => onEditStatus(record)}
                >
                    <Pencil size={16} />
                </S.ActionButton>
            </S.ActionButtons>
        ),
    },
];
