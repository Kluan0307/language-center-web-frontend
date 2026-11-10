import styled from 'styled-components';
import type { StudyStatus } from '../../types/enrollment';

export const EnrollmentContainer = styled.div`
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

export const StudyStatusTag = styled.span<{ $status: StudyStatus }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;

    ${({ $status }) => {
        switch ($status) {
            case 'STUDYING':
                return `
                    background-color: #ECFDF5;
                    color: #059669;
                    border: 1px solid #A7F3D0;
                `;
            case 'DROPPED':
                return `
                    background-color: #FEF2F2;
                    color: #DC2626;
                    border: 1px solid #FECACA;
                `;
            case 'COMPLETED':
                return `
                    background-color: #F1F5F9;
                    color: #475569;
                    border: 1px solid #CBD5E1;
                `;
            case 'TRANSFERRED':
                return `
                    background-color: #EFF6FF;
                    color: #2563EB;
                    border: 1px solid #BFDBFE;
                `;
            case 'RESERVED':
                return `
                    background-color: #FFFBEB;
                    color: #D97706;
                    border: 1px solid #FDE68A;
                `;
            default:
                return `
                    background-color: #F1F5F9;
                    color: #64748B;
                `;
        }
    }}

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
    }
`;

export const LevelBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    background-color: #F3E8FF;
    color: #7E22CE;
    font-size: 12.5px;
    font-weight: 600;
    border: 1px solid #E9D5FF;
`;

export const ClassBadge = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    .class-name {
        font-weight: 600;
        color: #0F172A;
        font-size: 13.5px;
    }

    .class-code {
        font-size: 12px;
        color: #64748B;
    }
`;

export const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
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
            case 'edit':
                return `
                    color: #059669;
                    &:hover {
                        background-color: #ECFDF5;
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

/* Modal Styles */
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

export const ModalContainer = styled.div<{ $maxWidth?: string }>`
    background-color: #FFFFFF;
    border-radius: 12px;
    width: 100%;
    max-width: ${({ $maxWidth }) => $maxWidth || '560px'};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
    animation: modalScaleIn 0.2s ease-out;

    @keyframes modalScaleIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
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
    background: none;
    border: none;
    color: #64748B;
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
    gap: 18px;
`;

export const StepIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 30px;
        right: 30px;
        height: 2px;
        background-color: #E2E8F0;
        z-index: 1;
        transform: translateY(-50%);
    }
`;

export const StepItem = styled.div<{ $active?: boolean; $completed?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 2;
    background-color: #FFFFFF;
    padding: 0 8px;

    .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        background-color: ${({ $active, $completed }) =>
            $active ? '#2563EB' : $completed ? '#059669' : '#E2E8F0'};
        color: ${({ $active, $completed }) =>
            $active || $completed ? '#FFFFFF' : '#64748B'};
        transition: all 0.2s ease-in-out;
    }

    .step-title {
        font-size: 13px;
        font-weight: 600;
        color: ${({ $active }) => ($active ? '#2563EB' : '#64748B')};
    }
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
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

export const ReadonlyCard = styled.div`
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13.5px;

        .lbl {
            color: #64748B;
            font-weight: 500;
        }

        .val {
            color: #0F172A;
            font-weight: 600;
        }
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
