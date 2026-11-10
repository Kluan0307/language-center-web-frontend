import { useState, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
    GraduationCap,
    UserCheck,
    UserX,
    Award,
    Eye,
    Pencil,
    Trash2,
    X,
    RotateCcw,
    Calendar,
    Mail,
    Phone,
    User,
    BookOpen,
    Briefcase,
} from 'lucide-react';
import * as S from './TeacherManagement.styles';
import Sidebar from '../../components/Layout/Sidebar';
import { CommonTable, PrimaryButton, SecondaryButton, message } from '../../components/Common';
import { mockTeachers } from '../../data/teachers.mock';
import type { Teacher, WorkStatus } from '../../types';

function TeacherManagement() {
    const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [specFilter, setSpecFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);

    const initialFormData = {
        fullName: '',
        username: '',
        email: '',
        phone: '',
        specialization: 'IELTS',
        qualification: 'Cử nhân Ngôn ngữ Anh',
        experience: '2 năm',
        certificate: 'IELTS 7.5',
        hireDate: new Date().toISOString().split('T')[0],
        workStatus: 'WORKING' as WorkStatus,
    };

    const [formData, setFormData] = useState(initialFormData);

    const specializationOptions = useMemo(() => {
        const specs = Array.from(new Set(teachers.map((t) => t.specialization)));
        return specs.filter(Boolean);
    }, [teachers]);

    const stats = useMemo(() => {
        return {
            total: teachers.length,
            working: teachers.filter((t) => t.workStatus === 'WORKING').length,
            resigned: teachers.filter((t) => t.workStatus === 'RESIGNED').length,
            specializations: specializationOptions.length,
        };
    }, [teachers, specializationOptions]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter((item) => {
            const matchesSearch =
                searchKeyword.trim() === '' ||
                item.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.phone.includes(searchKeyword) ||
                item.specialization.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.qualification.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.certificate.toLowerCase().includes(searchKeyword.toLowerCase());

            const matchesSpec = specFilter === 'ALL' || item.specialization === specFilter;
            const matchesStatus = statusFilter === 'ALL' || item.workStatus === statusFilter;

            return matchesSearch && matchesSpec && matchesStatus;
        });
    }, [teachers, searchKeyword, specFilter, statusFilter]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTeachers.slice(startIndex, startIndex + pageSize);
    }, [filteredTeachers, currentPage, pageSize]);

    const handleResetFilters = () => {
        setSearchKeyword('');
        setSpecFilter('ALL');
        setStatusFilter('ALL');
        setCurrentPage(1);
        message.info('Đã đặt lại bộ lọc danh sách giáo viên!');
    };

    const handleOpenEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            fullName: teacher.fullName,
            username: teacher.account?.username || '',
            email: teacher.email,
            phone: teacher.phone,
            specialization: teacher.specialization,
            qualification: teacher.qualification,
            experience: teacher.experience,
            certificate: teacher.certificate,
            hireDate: teacher.hireDate,
            workStatus: teacher.workStatus,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !editingTeacher) {
            message.warning('Vui lòng nhập họ và tên giáo viên!');
            return;
        }

        setTeachers((prev) =>
            prev.map((item) =>
                item.id === editingTeacher.id
                    ? {
                          ...item,
                          fullName: formData.fullName,
                          email: formData.email,
                          phone: formData.phone,
                          specialization: formData.specialization,
                          qualification: formData.qualification,
                          experience: formData.experience,
                          certificate: formData.certificate,
                          hireDate: formData.hireDate,
                          workStatus: formData.workStatus,
                          account: {
                              ...item.account,
                              username: formData.username || item.account.username,
                              status: formData.workStatus === 'WORKING',
                          },
                      }
                    : item
            )
        );
        if (detailTeacher && detailTeacher.id === editingTeacher.id) {
            setDetailTeacher({
                ...detailTeacher,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                specialization: formData.specialization,
                qualification: formData.qualification,
                experience: formData.experience,
                certificate: formData.certificate,
                hireDate: formData.hireDate,
                workStatus: formData.workStatus,
            });
        }

        message.success('Cập nhật thông tin giáo viên thành công!');
        handleCloseModal();
    };

    const handleDeleteTeacher = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giáo viên này không?')) {
            setTeachers((prev) => prev.filter((item) => item.id !== id));
            if (detailTeacher && detailTeacher.id === id) {
                setDetailTeacher(null);
            }
            message.success('Xóa giáo viên thành công!');
        }
    };

    const getStatusLabel = (status: WorkStatus) => {
        switch (status) {
            case 'WORKING':
                return 'Đang làm việc';
            case 'RESIGNED':
                return 'Đã thôi việc';
            default:
                return status;
        }
    };

    const columns: ColumnsType<Teacher> = [
        {
            title: 'Mã GV',
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
            title: 'Chuyên môn',
            dataIndex: 'specialization',
            key: 'specialization',
            render: (spec: string) => (
                <S.SpecializationBadge>{spec}</S.SpecializationBadge>
            ),
        },
        {
            title: 'Trình độ',
            dataIndex: 'qualification',
            key: 'qualification',
        },
        {
            title: 'Chứng chỉ',
            dataIndex: 'certificate',
            key: 'certificate',
        },
        {
            title: 'Kinh nghiệm',
            dataIndex: 'experience',
            key: 'experience',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'workStatus',
            key: 'workStatus',
            render: (status: WorkStatus) => (
                <S.StatusBadge $status={status}>{getStatusLabel(status)}</S.StatusBadge>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record: Teacher) => (
                <S.ActionButtons onClick={(e) => e.stopPropagation()}>
                    <S.ActionButton
                        $variant="view"
                        title="Xem chi tiết"
                        type="button"
                        onClick={() => setDetailTeacher(record)}
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
                        $variant="delete"
                        title="Xóa"
                        type="button"
                        onClick={() => handleDeleteTeacher(record.id)}
                    >
                        <Trash2 size={16} />
                    </S.ActionButton>
                </S.ActionButtons>
            ),
        },
    ];

    return (
        <S.TeacherContainer>
            <Sidebar />
            <S.MainContent>
                <S.HeaderSection>
                    <S.TitleWrapper>
                        <S.Title>Quản lý giáo viên</S.Title>
                        <S.Subtitle>
                            Quản lý hồ sơ giảng viên, chuyên môn, bằng cấp và trạng thái công tác
                        </S.Subtitle>
                    </S.TitleWrapper>

                    <S.StatsGrid>
                        <S.StatCard $bg="#EFF6FF" $color="#2563EB">
                            <div className="stat-icon">
                                <GraduationCap size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.total}</p>
                                <p className="stat-label">Tổng số giáo viên</p>
                            </div>
                        </S.StatCard>

                        <S.StatCard $bg="#ECFDF5" $color="#059669">
                            <div className="stat-icon">
                                <UserCheck size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.working}</p>
                                <p className="stat-label">Đang giảng dạy</p>
                            </div>
                        </S.StatCard>

                        <S.StatCard $bg="#FEF2F2" $color="#EF4444">
                            <div className="stat-icon">
                                <UserX size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.resigned}</p>
                                <p className="stat-label">Đã thôi việc</p>
                            </div>
                        </S.StatCard>

                        <S.StatCard $bg="#F5F3FF" $color="#7C3AED">
                            <div className="stat-icon">
                                <Award size={22} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-value">{stats.specializations}</p>
                                <p className="stat-label">Chuyên môn đào tạo</p>
                            </div>
                        </S.StatCard>
                    </S.StatsGrid>
                </S.HeaderSection>

                <S.ContentCard>
                    <S.FilterBar>
                        <S.FilterGroup>
                            <S.FilterLabel>Chuyên môn:</S.FilterLabel>
                            <S.Select
                                value={specFilter}
                                onChange={(e) => {
                                    setSpecFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">Tất cả chuyên môn</option>
                                {specializationOptions.map((sp) => (
                                    <option key={sp} value={sp}>
                                        {sp}
                                    </option>
                                ))}
                            </S.Select>
                        </S.FilterGroup>

                        <S.FilterGroup>
                            <S.FilterLabel>Trạng thái:</S.FilterLabel>
                            <S.Select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="WORKING">Đang làm việc</option>
                                <option value="RESIGNED">Đã thôi việc</option>
                            </S.Select>
                        </S.FilterGroup>

                        {(searchKeyword || specFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <S.ResetButton type="button" onClick={handleResetFilters}>
                                <RotateCcw size={14} />
                                <span>Đặt lại</span>
                            </S.ResetButton>
                        )}
                    </S.FilterBar>

                    <CommonTable<Teacher>
                        columns={columns}
                        dataSource={paginatedData}
                        rowKey="id"
                        onSearch={(value) => {
                            setSearchKeyword(value);
                            setCurrentPage(1);
                        }}
                        searchValue={searchKeyword}
                        searchPlaceholder="Tìm kiếm theo tên, email, chuyên môn..."
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={filteredTeachers.length}
                        onPageChange={(page, pSize) => {
                            setCurrentPage(page);
                            if (pSize) setPageSize(pSize);
                        }}
                        onRow={(record) => ({
                            onClick: () => setDetailTeacher(record),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </S.ContentCard>
            </S.MainContent>

            {isModalOpen && (
                <S.ModalOverlay onClick={handleCloseModal}>
                    <S.ModalContainer onClick={(e) => e.stopPropagation()}>
                        <S.ModalHeader>
                            <h3>Chỉnh sửa thông tin giáo viên</h3>
                            <S.CloseButton type="button" onClick={handleCloseModal}>
                                <X size={20} />
                            </S.CloseButton>
                        </S.ModalHeader>


                        <S.ModalBody onSubmit={handleFormSubmit}>
                            <S.FormGrid>
                                <S.FormGroup>
                                    <S.FormLabel>
                                        Họ và tên <span className="required">*</span>
                                    </S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        required
                                        placeholder="Nhập họ và tên giáo viên"
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
                                        placeholder="Ví dụ: teacher_lan"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Email</S.FormLabel>
                                    <S.FormInput
                                        type="email"
                                        placeholder="teacher@educenter.com"
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

                                <S.FormGroup>
                                    <S.FormLabel>Chuyên môn</S.FormLabel>
                                    <S.FormSelect
                                        value={formData.specialization}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specialization: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="IELTS">IELTS</option>
                                        <option value="TOEIC">TOEIC</option>
                                        <option value="Tiếng Anh giao tiếp">Tiếng Anh giao tiếp</option>
                                        <option value="Tiếng Anh thiếu nhi">Tiếng Anh thiếu nhi</option>
                                        <option value="Tiếng Anh tổng quát">Tiếng Anh tổng quát</option>
                                    </S.FormSelect>
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Trình độ học vấn</S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        placeholder="Ví dụ: Thạc sĩ Ngôn ngữ Anh"
                                        value={formData.qualification}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                qualification: e.target.value,
                                            })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Chứng chỉ chuyên môn</S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        placeholder="Ví dụ: IELTS 8.0, TESOL"
                                        value={formData.certificate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                certificate: e.target.value,
                                            })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Kinh nghiệm</S.FormLabel>
                                    <S.FormInput
                                        type="text"
                                        placeholder="Ví dụ: 5 năm"
                                        value={formData.experience}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                experience: e.target.value,
                                            })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Ngày bắt đầu làm việc</S.FormLabel>
                                    <S.FormInput
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, hireDate: e.target.value })
                                        }
                                    />
                                </S.FormGroup>

                                <S.FormGroup>
                                    <S.FormLabel>Trạng thái công tác</S.FormLabel>
                                    <S.FormSelect
                                        value={formData.workStatus}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                workStatus: e.target.value as WorkStatus,
                                            })
                                        }
                                    >
                                        <option value="WORKING">Đang làm việc</option>
                                        <option value="RESIGNED">Đã thôi việc</option>
                                    </S.FormSelect>
                                </S.FormGroup>
                            </S.FormGrid>

                            <S.ModalFooter>
                                <SecondaryButton type="button" onClick={handleCloseModal}>
                                    Hủy
                                </SecondaryButton>
                                <PrimaryButton type="submit">
                                    {editingTeacher ? 'Cập nhật' : 'Thêm giáo viên'}
                                </PrimaryButton>
                            </S.ModalFooter>
                        </S.ModalBody>
                    </S.ModalContainer>
                </S.ModalOverlay>
            )}

            {detailTeacher && (
                <S.DrawerOverlay onClick={() => setDetailTeacher(null)}>
                    <S.DrawerContainer onClick={(e) => e.stopPropagation()}>
                        <S.DrawerHeader>
                            <h3>Hồ sơ giáo viên</h3>
                            <S.CloseButton type="button" onClick={() => setDetailTeacher(null)}>
                                <X size={20} />
                            </S.CloseButton>
                        </S.DrawerHeader>

                        <S.DrawerBody>
                            <S.ProfileHeader>
                                <div className="avatar">
                                    {detailTeacher.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-info">
                                    <h4>{detailTeacher.fullName}</h4>
                                    <p className="meta">Mã giáo viên: #{detailTeacher.id}</p>
                                    <S.StatusBadge $status={detailTeacher.workStatus}>
                                        {getStatusLabel(detailTeacher.workStatus)}
                                    </S.StatusBadge>
                                </div>
                            </S.ProfileHeader>

                            <S.SectionBlock>
                                <p className="section-title">Thông tin liên hệ & Tài khoản</p>
                                <S.InfoList>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Mail size={15} /> Email
                                        </span>
                                        <span className="value">{detailTeacher.email}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Phone size={15} /> Số điện thoại
                                        </span>
                                        <span className="value">{detailTeacher.phone}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <User size={15} /> Tên đăng nhập
                                        </span>
                                        <span className="value">
                                            {detailTeacher.account?.username || 'Chưa thiết lập'}
                                        </span>
                                    </S.InfoItem>
                                </S.InfoList>
                            </S.SectionBlock>

                            <S.SectionBlock>
                                <p className="section-title">Hồ sơ chuyên môn</p>
                                <S.InfoList>
                                    <S.InfoItem>
                                        <span className="label">
                                            <BookOpen size={15} /> Chuyên môn
                                        </span>
                                        <span className="value">
                                            <S.SpecializationBadge>
                                                {detailTeacher.specialization}
                                            </S.SpecializationBadge>
                                        </span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <GraduationCap size={15} /> Trình độ học vấn
                                        </span>
                                        <span className="value">{detailTeacher.qualification}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Award size={15} /> Chứng chỉ
                                        </span>
                                        <span className="value">{detailTeacher.certificate}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Briefcase size={15} /> Kinh nghiệm
                                        </span>
                                        <span className="value">{detailTeacher.experience}</span>
                                    </S.InfoItem>
                                    <S.InfoItem>
                                        <span className="label">
                                            <Calendar size={15} /> Ngày vào làm
                                        </span>
                                        <span className="value">{detailTeacher.hireDate}</span>
                                    </S.InfoItem>
                                </S.InfoList>
                            </S.SectionBlock>
                        </S.DrawerBody>

                        <S.DrawerFooter>
                            <SecondaryButton type="button" onClick={() => setDetailTeacher(null)}>
                                Đóng
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                onClick={() => {
                                    const tc = detailTeacher;
                                    setDetailTeacher(null);
                                    handleOpenEditModal(tc);
                                }}
                            >
                                <Pencil size={15} />
                                <span>Chỉnh sửa</span>
                            </PrimaryButton>
                        </S.DrawerFooter>
                    </S.DrawerContainer>
                </S.DrawerOverlay>
            )}
        </S.TeacherContainer>
    );
}

export default TeacherManagement;
