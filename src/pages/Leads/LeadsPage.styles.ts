import styled from 'styled-components';

export const LeadContainer = styled.div`
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

    /* Lost row style - opacity & muted look */
    .lead-row-lost {
        opacity: 0.58;
        background-color: #F8FAFC;
        
        &:hover > td {
            background-color: #F1F5F9 !important;
        }
    }
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

export const StatusBadge = styled.span<{ $status: 'NEW' | 'CONTACTED' | 'CONSULTING' | 'CONVERTED' | 'LOST' }>`
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
            case 'NEW':
                return `
                    background-color: #EFF6FF;
                    color: #2563EB;
                    border: 1px solid #BFDBFE;
                `;
            case 'CONTACTED':
                return `
                    background-color: #DBEAFE;
                    color: #1E40AF;
                    border: 1px solid #93C5FD;
                `;
            case 'CONSULTING':
                return `
                    background-color: #FFFBEB;
                    color: #D97706;
                    border: 1px solid #FDE68A;
                `;
            case 'CONVERTED':
                return `
                    background-color: #ECFDF5;
                    color: #059669;
                    border: 1px solid #A7F3D0;
                `;
            case 'LOST':
                return `
                    background-color: #F1F5F9;
                    color: #64748B;
                    border: 1px solid #CBD5E1;
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

export const CourseBadge = styled.span`
    display: inline-block;
    padding: 3px 8px;
    background-color: #EFF6FF;
    color: #1D4ED8;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid #DBEAFE;
`;

export const TextMuted = styled.span`
    color: #94A3B8;
    font-size: 13px;
    font-style: italic;
`;

export const SourceBadge = styled.span`
    display: inline-block;
    padding: 2px 7px;
    background-color: #F8FAFC;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    border: 1px solid #E2E8F0;
`;

export const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const ActionButton = styled.button<{ $variant?: 'edit' | 'convert' | 'view' }>`
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
                    color: #2563EB;
                    &:hover {
                        background-color: #EFF6FF;
                    }
                `;
            case 'convert':
                return `
                    color: #059669;
                    &:hover {
                        background-color: #ECFDF5;
                    }
                `;
            case 'view':
                return `
                    color: #64748B;
                    &:hover {
                        background-color: #F1F5F9;
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
    max-width: ${({ $maxWidth }) => $maxWidth || '640px'};
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

export const FormTextarea = styled.textarea`
    width: 100%;
    padding: 9px 12px;
    background-color: #FFFFFF;
    color: #0F172A;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 13.5px;
    outline: none;
    box-sizing: border-box;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
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

export const InfoBanner = styled.div<{ $type?: 'info' | 'success' | 'warning' }>`
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.5;

    ${({ $type }) => {
        switch ($type) {
            case 'success':
                return `
                    background-color: #ECFDF5;
                    border: 1px solid #A7F3D0;
                    color: #065F46;
                `;
            case 'warning':
                return `
                    background-color: #FFFBEB;
                    border: 1px solid #FDE68A;
                    color: #92400E;
                `;
            case 'info':
            default:
                return `
                    background-color: #EFF6FF;
                    border: 1px solid #BFDBFE;
                    color: #1E40AF;
                `;
        }
    }}
`;

export const LeadSummaryBox = styled.div`
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const SummaryItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13.5px;

    .label {
        color: #64748B;
        font-weight: 500;
    }

    .value {
        color: #0F172A;
        font-weight: 600;
    }
`;

export const NotesHistoryBox = styled.div`
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 12px;
    max-height: 130px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
`;
