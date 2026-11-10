import type { ColumnsType } from 'antd/es/table';
import { Pencil, UserCheck, Eye } from 'lucide-react';
import { Tooltip } from 'antd';
import type { Lead, LeadStatus } from '../../types';
import * as S from './LeadsPage.styles';

export const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    try {
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

export const getStatusLabel = (status: LeadStatus): string => {
    switch (status) {
        case 'NEW':
            return 'Mới';
        case 'CONTACTED':
            return 'Đã liên hệ';
        case 'CONSULTING':
            return 'Đang tư vấn';
        case 'CONVERTED':
            return 'Đã chuyển đổi';
        case 'LOST':
            return 'Đã mất';
        default:
            return status;
    }
};

interface LeadColumnsProps {
    onUpdate: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    onView?: (lead: Lead) => void;
}

export const getLeadColumns = ({
    onUpdate,
    onConvert,
    onView,
}: LeadColumnsProps): ColumnsType<Lead> => {
    return [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text: string, record: Lead) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{text}</div>
                    {record.email && (
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{record.email}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string) => (
                <span style={{ fontWeight: 500, color: '#334155' }}>{phone}</span>
            ),
        },
        {
            title: 'Khóa học quan tâm',
            dataIndex: 'interestedCourse',
            key: 'interestedCourse',
            render: (course: Lead['interestedCourse']) => {
                if (course?.name) {
                    return <S.CourseBadge>{course.name}</S.CourseBadge>;
                }
                return <S.TextMuted>Chưa xác định</S.TextMuted>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: LeadStatus) => {
                return (
                    <S.StatusBadge $status={status}>
                        {getStatusLabel(status)}
                    </S.StatusBadge>
                );
            },
        },
        {
            title: 'Người phụ trách',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            render: (assignedTo: Lead['assignedTo']) => (
                <span style={{ color: '#334155' }}>{assignedTo?.fullName || 'Chưa gán'}</span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => (
                <span style={{ color: '#64748B', fontSize: '13px' }}>
                    {formatDate(createdAt)}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_, record: Lead) => {
                const isConverted = record.status === 'CONVERTED';
                const canConvert = record.status === 'CONSULTING' || record.status === 'CONTACTED';
                const canUpdate = !isConverted;

                return (
                    <S.ActionButtons style={{ justifyContent: 'center' }}>
                        {/* Nút Xem chi tiết nếu là Converted hoặc tùy chọn */}
                        {onView && isConverted && (
                            <Tooltip title="Xem chi tiết">
                                <S.ActionButton
                                    type="button"
                                    $variant="view"
                                    onClick={() => onView(record)}
                                >
                                    <Eye size={16} />
                                </S.ActionButton>
                            </Tooltip>
                        )}

                        {/* Nút Cập nhật - Chỉ hiện khi status KHÁC 'CONVERTED' */}
                        {canUpdate && (
                            <Tooltip title="Cập nhật trạng thái & ghi chú">
                                <S.ActionButton
                                    type="button"
                                    $variant="edit"
                                    onClick={() => onUpdate(record)}
                                >
                                    <Pencil size={16} />
                                </S.ActionButton>
                            </Tooltip>
                        )}

                        {/* Nút Chuyển đổi thành học viên - Chỉ hiện khi CONSULTING hoặc CONTACTED */}
                        {canConvert && (
                            <Tooltip title="Chuyển đổi thành học viên">
                                <S.ActionButton
                                    type="button"
                                    $variant="convert"
                                    onClick={() => onConvert(record)}
                                >
                                    <UserCheck size={16} />
                                </S.ActionButton>
                            </Tooltip>
                        )}
                    </S.ActionButtons>
                );
            },
        },
    ];
};
