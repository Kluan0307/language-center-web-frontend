import { useState, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
    UserCheck,
    UserX,
    Shield,
    Eye,
    Pencil,
    Trash2,
    X,
    RotateCcw,
    Mail,
    Phone,
    User,
    Power,
} from 'lucide-react';
import * as S from './StaffManagement.styles';
import Sidebar from '../../components/Layout/Sidebar';
import { CommonTable, PrimaryButton, SecondaryButton, message } from '../../components/Common';
import { mockStaffs } from '../../data/staffs.mock';
import type { Staff } from '../../types';

function StaffManagement() {
    const [staffs, setStaffs] = useState<Staff[]>(mockStaffs);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [detailStaff, setDetailStaff] = useState<Staff | null>(null);

    const initialFormData = {
        fullName: '',
        username: '',
        email: '',
        phone: '',
        status: true,
    };

    const [formData, setFormData] = useState(initialFormData);

    const stats = useMemo(() => {
        return {
            total: staffs.length,
            active: staffs.filter((s) => s.account?.status).length,
            locked: staffs.filter((s) => !s.account?.status).length,
        };
    }, [staffs]);

    const filteredStaffs = useMemo(() => {
        return staffs.filter((item) => {
            const matchesSearch =
                searchKeyword.trim() === '' ||
                item.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.phone.includes(searchKeyword) ||
                (item.account?.username || '').toLowerCase().includes(searchKeyword.toLowerCase());

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && item.account?.status) ||
                (statusFilter === 'LOCKED' && !item.account?.status);

            return matchesSearch && matchesStatus;
        });
    }, [staffs, searchKeyword, statusFilter]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredStaffs.slice(startIndex, startIndex + pageSize);
    }, [filteredStaffs, currentPage, pageSize]);

    const handleResetFilters = () => {
        setSearchKeyword('');
        setStatusFilter('ALL');
        setCurrentPage(1);
        message.info('Đã đặt lại bộ lọc danh sách nhân viên!');
    };

    const handleOpenEditModal = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData({
            fullName: staff.fullName,
            username: staff.account?.username || '',
            email: staff.email,
            phone: staff.phone,
            status: staff.account?.status ?? true,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !editingStaff) {
            message.warning('Vui lòng nhập họ và tên nhân viên!');
            return;
        }

        setStaffs((prev) =>
            prev.map((item) =>
                item.id === editingStaff.id
                    ? {
                          ...item,
                          fullName: formData.fullName,
                          email: formData.email,
                          phone: formData.phone,
                          account: {
                              ...item.account,
                              username: formData.username || item.account.username,
                              status: formData.status,
                          },
                      }
                    : item
            )
        );
        if (detailStaff && detailStaff.id === editingStaff.id) {
            setDetailStaff({
                ...detailStaff,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                account: {
                    ...detailStaff.account,
                    username: formData.username || detailStaff.account.username,
                    status: formData.status,
                },
            });
        }

        message.success('Cập nhật thông tin nhân viên thành công!');
        handleCloseModal();
    };

    const handleToggleStatus = (id: number) => {
        let newStatus = true;
        setStaffs((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updatedStatus = !item.account?.status;
                    newStatus = updatedStatus;
                    return {
                        ...item,
                        account: {
                            ...item.account,
                            status: updatedStatus,
                        },
                    };
                }
                return item;
            })
        );
        if (detailStaff && detailStaff.id === id) {
            setDetailStaff({
                ...detailStaff,
                account: {
                    ...detailStaff.account,
                    status: !detailStaff.account?.status,
                },
            });
        }
        message.success(
            newStatus
                ? 'Đã kích hoạt tài khoản nhân viên!'
                : 'Đã khóa tài khoản nhân viên!'
        );
    };

    const handleDeleteStaff = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
            setStaffs((prev) => prev.filter((item) => item.id !== id));
            if (detailStaff && detailStaff.id === id) {
                setDetailStaff(null);
            }
            message.success('Xóa nhân viên thành công!');
        }
    };

    const columns: ColumnsType<Staff> = [
        {
            title: 'Mã NV',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <strong>#{id}</strong>,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name: string) => (
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{name}</span>
            ),
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: ['account', 'username'],
            key: 'username',
            render: (username: string) => <span style={{ color: '#475569' }}>{username}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Vai trò',
            dataIndex: ['account', 'role'],
            key: 'role',
            render: (role: string) => <S.RoleBadge>{role || 'STAFF'}</S.RoleBadge>,
        },
        {
            title: 'Trạng thái',
            dataIndex: ['account', 'status'],
            key: 'status',
            render: (status: boolean) => (
                <S.StatusBadge $status={status}>
                    {status ? 'Đang hoạt động' : 'Tạm khóa'}
                </S.StatusBadge>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 140,
            render: (_, record: Staff) => (
                <S.ActionButtons onClick={(e) => e.stopPropagation()}>
                    <S.ActionButton
                        $variant="view"
                        title="Xem chi tiết"
                        type="button"
                        onClick={() => setDetailStaff(record)}
                    >
                        <Eye size={16} />
                    </S.ActionButton>
                    <S.ActionButton
                        $variant="edit"
                        title="Chỉnh sửa"
                        type="button"
                        onClick={() => handleOpenEditModal(record)}
                    >
                        <Pencil size={16} />
                    </S.ActionButton>
                    <S.ActionButton
                        $variant="toggle"
                        title={record.account?.status ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        type="button"
                        onClick={() => handleToggleStatus(record.id)}
                    >
                        <Power size={16} />
                    </S.ActionButton>
                    <S.ActionButton
                        $variant="delete"
                        title="Xóa"
                        type="button"
                        onClick={() => handleDeleteStaff(record.id)}
                    >
                        <Trash2 size={16} />
                    </S.ActionButton>
                </S.ActionButtons>
            ),
        },
    ];

    return (
        <S.StaffContainer>
            <Sidebar />
            <S.MainContent>
                <S.HeaderSection>
                    <S.TitleWrapper>
                        <S.Title>Quản lý nhân viên</S.Title>
                        <S.Subtitle>
                            Quản lý danh sách nhân sự vận hành, tư vấn tuyển sinh và tài khoản hệ thống
                        </S.Subtitle>
                    </S.TitleWrapper>

                    <S.StatsGrid>
                        <S.StatCard $bg="#EFF6FF" $color="#2563EB">
                            <div className="stat-icon">
                                <Shield size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.total}</p>
                                <p className="stat-label">Tổng số nhân viên</p>
                            </div>
                        </S.StatCard>

                        <S.StatCard $bg="#ECFDF5" $color="#059669">
                            <div className="stat-icon">
                                <UserCheck size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.active}</p>
                                <p className="stat-label">Đang hoạt động</p>
                            </div>
                        </S.StatCard>

                        <S.StatCard $bg="#FEF2F2" $color="#EF4444">
                            <div className="stat-icon">
                                <UserX size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.locked}</p>
                                <p className="stat-label">Tài khoản tạm khóa</p>
                            </div>
                        </S.StatCard>
                    </S.StatsGrid>
                </S.HeaderSection>

                <S.ContentCard>
                    <S.FilterBar>
                        <S.FilterGroup>
                            <S.FilterLabel>Trạng thái tài khoản:</S.FilterLabel>
                            <S.Select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="LOCKED">Tạm khóa</option>
                            </S.Select>
                        </S.FilterGroup>

                        {(searchKeyword || statusFilter !== 'ALL') && (
                            <S.ResetButton type="button" onClick={handleResetFilters}>
                                <RotateCcw size={14} />
                                <span>Đặt lại</span>
                            </S.ResetButton>
                        )}
                    </S.FilterBar>

                    <CommonTable<Staff>
                        columns={columns}
                        dataSource={paginatedData}
                        rowKey="id"
                        onSearch={(value) => {
                            setSearchKeyword(value);
                            setCurrentPage(1);
                        }}
                        searchValue={searchKeyword}
                        searchPlaceholder="Tìm kiếm theo tên, username, email, SĐT..."
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={filteredStaffs.length}
                        onPageChange={(page, pSize) => {
                            setCurrentPage(page);
                            if (pSize) setPageSize(pSize);
                        }}
                        onRow={(record) => ({
                            onClick: () => setDetailStaff(record),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </S.ContentCard>
            </S.MainContent>

            {isModalOpen && (
                <S.ModalOverlay onClick={handleCloseModal}>
                    <S.ModalContainer onClick={(e) => e.stopPropagation()}>
                        <S.ModalHeader>
                            <h3>Chỉnh sửa thông tin nhân viên</h3>
                            <S.CloseButton type="button" onClick={handleCloseModal}>
                                <X size={20} />
                            </S.CloseButton>
                        </S.ModalHeader>


                        <S.ModalBody onSubmit={handleFormSubmit}>
                            <S.FormGrid>
                                <S.FormGroup $fullWidth>
                                    <S.FormLabel>
                                        Họ và tên <span className="required">*</span>
                                    </S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        required
                                        placeholder="Nhập họ và tên nhân viên"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fullName: e.target.value })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Tên đăng nhập (Username)</S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        placeholder="Ví dụ: staff_mai"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Trạng thái tài khoản</S.FormLabel>
                                    <S.FormSelect
                                        value={formData.status ? 'ACTIVE' : 'LOCKED'}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value === 'ACTIVE',
                                            })
                                        }
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="LOCKED">Tạm khóa</option>
                                    </S.FormSelect>
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Email</S.FormLabel>
                                    <S.FormInput
                                        type="email"
                                        placeholder="staff@educenter.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Số điện thoại</S.FormLabel>
                                    <S.FormInput
                                        type="tel"
                                        placeholder="0912345678"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </S.FormGroup>
                            </S.FormGrid>

                            <S.ModalFooter>
                                <SecondaryButton type="button" onClick={handleCloseModal}>
                                    Hủy
                                </SecondaryButton>
                                <PrimaryButton type="submit">
                                    {editingStaff ? 'Cập nhật' : 'Thêm nhân viên'}
                                </PrimaryButton>
                            </S.ModalFooter>
                        </S.ModalBody>
                    </S.ModalContainer>
                </S.ModalOverlay>
            )}

            {detailStaff && (
                <S.DrawerOverlay onClick={() => setDetailStaff(null)}>
                    <S.DrawerContainer onClick={(e) => e.stopPropagation()}>
                        <S.DrawerHeader>
                            <h3>Hồ sơ nhân viên</h3>
                            <S.CloseButton type="button" onClick={() => setDetailStaff(null)}>
                                <X size={20} />
                            </S.CloseButton>
                        </S.DrawerHeader>

                        <S.DrawerBody>
                            <S.ProfileHeader>
                                <div className="avatar">
                                    {detailStaff.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-info">
                                    <h4>{detailStaff.fullName}</h4>
                                    <p className="meta">Mã nhân viên: #{detailStaff.id}</p>
                                    <S.StatusBadge $status={detailStaff.account?.status ?? true}>
                                        {detailStaff.account?.status ? 'Đang hoạt động' : 'Tạm khóa'}
                                    </S.StatusBadge>
                                </div>
                            </S.ProfileHeader>

                            <S.SectionBlock>
                                <p className="section-title">Thông tin liên hệ</p>
                                <S.InfoList>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Mail size={15} /> Email
                                        </span>
                                        <span className="value">{detailStaff.email}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Phone size={15} /> Số điện thoại
                                        </span>
                                        <span className="value">{detailStaff.phone}</span>
                                    </S.InfoItem>
                                </S.InfoList>
                            </S.SectionBlock>

                            <S.SectionBlock>
                                <p className="section-title">Thông tin tài khoản hệ thống</p>
                                <S.InfoList>
                                    <S.InfoItem>
                                        <span className="label">
                                            <User size={15} /> Tên đăng nhập
                                        </span>
                                        <span className="value">
                                            {detailStaff.account?.username || 'Chưa thiết lập'}
                                        </span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Shield size={15} /> Vai trò
                                        </span>
                                        <span className="value">
                                            <S.RoleBadge>
                                                {detailStaff.account?.role || 'STAFF'}
                                            </S.RoleBadge>
                                        </span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Power size={15} /> Trạng thái
                                        </span>
                                        <span className="value">
                                            {detailStaff.account?.status
                                                ? 'Cho phép truy cập'
                                                : 'Bị tạm khóa'}
                                        </span>
                                    </S.InfoItem>
                                </S.InfoList>
                            </S.SectionBlock>
                        </S.DrawerBody>

                        <S.DrawerFooter>
                            <SecondaryButton type="button" onClick={() => setDetailStaff(null)}>
                                Đóng
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                onClick={() => {
                                    const st = detailStaff;
                                    setDetailStaff(null);
                                    handleOpenEditModal(st);
                                }}
                            >
                                <Pencil size={15} />
                                <span>Chỉnh sửa</span>
                            </PrimaryButton>
                        </S.DrawerFooter>
                    </S.DrawerContainer>
                </S.DrawerOverlay>
            )}
        </S.StaffContainer>
    );
}

export default StaffManagement;
