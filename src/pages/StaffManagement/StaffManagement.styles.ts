import styled from 'styled-components';

export const StaffContainer = styled.div`
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #F8FAFC;
`;

export const MainContent = styled.main`
    flex: 1;
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    max-height: 100vh;
    box-sizing: border-box;
`;

export const HeaderSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const TitleWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #0F172A;
    margin: 0;
`;

export const Subtitle = styled.p`
    font-size: 14px;
    color: #64748B;
    margin: 0;
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
`;

export const StatCard = styled.div<{ $color?: string; $bg?: string }>`
    background-color: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

    .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background-color: ${({ $bg }) => $bg || '#EFF6FF'};
        color: ${({ $color }) => $color || '#2563EB'};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #0F172A;
            margin: 0;
        }

        .stat-label {
            font-size: 13px;
            color: #64748B;
            margin: 0;
        }
    }
`;

export const ContentCard = styled.div`
    background-color: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

export const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding-bottom: 16px;
    border-bottom: 1px solid #F1F5F9;
`;

export const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const FilterLabel = styled.span`
    font-size: 13.5px;
    font-weight: 500;
    color: #475569;
    white-space: nowrap;
`;

export const Select = styled.select`
    padding: 8px 12px;
    font-size: 13.5px;
    color: #0F172A;
    background-color: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        border-color: #CBD5E1;
    }

    &:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
`;

export const ResetButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: transparent;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    color: #64748B;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #F8FAFC;
        color: #0F172A;
        border-color: #CBD5E1;
    }
`;

export const StatusBadge = styled.span<{ $status: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;

    ${({ $status }) =>
        $status
            ? `
                background-color: #ECFDF5;
                color: #059669;
                border: 1px solid #A7F3D0;
            `
            : `
                background-color: #FEF2F2;
                color: #EF4444;
                border: 1px solid #FECACA;
            `}

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
    }
`;

export const RoleBadge = styled.span`
    display: inline-block;
    padding: 3px 8px;
    background-color: #F1F5F9;
    color: #334155;
    font-size: 12.5px;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid #E2E8F0;
`;

export const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const ActionButton = styled.button<{ $variant?: 'view' | 'edit' | 'delete' | 'toggle' }>`
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    background-color: transparent;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    color: #2563EB;
                    &:hover {
                        background-color: #EFF6FF;
                    }
                `;
            case 'edit':
                return `
                    color: #059669;
                    &:hover {
                        background-color: #ECFDF5;
                    }
                `;
            case 'toggle':
                return `
                    color: #D97706;
                    &:hover {
                        background-color: #FFFBEB;
                    }
                `;
            case 'delete':
                return `
                    color: #EF4444;
                    &:hover {
                        background-color: #FEF2F2;
                    }
                `;
            default:
                return `
                    color: #64748B;
                    &:hover {
                        background-color: #F1F5F9;
                    }
                `;
        }
    }}
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
`;

export const ModalContainer = styled.div`
    background-color: #FFFFFF;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: modalFadeIn 0.2s ease-out;

    @keyframes modalFadeIn {
        from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;

export const ModalHeader = styled.div`
    padding: 18px 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        color: #0F172A;
    }
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease-in-out;

    &:hover {
        color: #0F172A;
        background-color: #F1F5F9;
    }
`;

export const ModalBody = styled.form`
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

export const FormGroup = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

export const FormLabel = styled.label`
    font-size: 13.5px;
    font-weight: 600;
    color: #334155;

    .required {
        color: #EF4444;
        margin-left: 2px;
    }
`;

export const FormInput = styled.input`
    width: 100%;
    padding: 9px 12px;
    background-color: #FFFFFF;
    color: #0F172A;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 13.5px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;

    &::placeholder {
        color: #94A3B8;
    }

    &:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
`;

export const FormSelect = styled.select`
    width: 100%;
    padding: 9px 12px;
    background-color: #FFFFFF;
    color: #0F172A;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 13.5px;
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
`;

export const ModalFooter = styled.div`
    padding: 16px 24px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    background-color: #F8FAFC;

    button {
        width: auto;
    }
`;

export const DrawerOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: flex-end;
    z-index: 1000;
`;

export const DrawerContainer = styled.div`
    width: 100%;
    max-width: 480px;
    height: 100%;
    background-color: #FFFFFF;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    animation: drawerSlideIn 0.25s ease-out;

    @keyframes drawerSlideIn {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
`;

export const DrawerHeader = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #0F172A;
    }
`;

export const DrawerBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #F1F5F9;

    .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #EFF6FF;
        color: #2563EB;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #BFDBFE;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        gap: 6px;

        h4 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
        }

        .meta {
            font-size: 13px;
            color: #64748B;
            margin: 0;
        }
    }
`;

export const SectionBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;

    .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #0F172A;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

export const InfoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 16px;
`;

export const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    .label {
        font-size: 13px;
        color: #64748B;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .value {
        font-size: 13.5px;
        color: #0F172A;
        font-weight: 600;
        text-align: right;
    }
`;

export const DrawerFooter = styled.div`
    padding: 16px 24px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    background-color: #F8FAFC;

    button {
        width: auto;
    }
`;
