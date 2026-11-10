import styled from 'styled-components';
import type { AttendanceStatus } from '../../types/attendance';

/* ─── Page Layout ────────────────────────────────────────── */
export const AttendanceContainer = styled.div`
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

/* ─── Header ─────────────────────────────────────────────── */
export const HeaderSection = styled.div`
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

/* ─── Selector Card ──────────────────────────────────────── */
export const SelectorCard = styled.div`
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    align-items: flex-end;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    flex-wrap: wrap;
`;

export const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 200px;
`;

export const FieldLabel = styled.label`
    font-size: 13px;
    font-weight: 600;
    color: #475569;
`;

/* ─── Stats Strip ────────────────────────────────────────── */
export const StatsStrip = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`;

export const StatPill = styled.div<{ $color: string; $bg: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    border-radius: 30px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid ${({ $color }) => $color}22;

    .count {
        font-size: 18px;
        font-weight: 700;
    }
`;

/* ─── Table Card ─────────────────────────────────────────── */
export const TableCard = styled.div`
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

export const TableHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    gap: 12px;
    flex-wrap: wrap;
`;

export const TableTitle = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const TableBadge = styled.span`
    background: #EFF6FF;
    color: #2563EB;
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
`;

export const AttTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const Th = styled.th`
    text-align: left;
    padding: 12px 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748B;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;

    &.center { text-align: center; }
`;

export const Td = styled.td`
    padding: 14px 20px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #F1F5F9;
    vertical-align: middle;

    &.center { text-align: center; }

    &:first-child {
        font-weight: 600;
        color: #0F172A;
    }
`;

export const Tr = styled.tr`
    transition: background 0.15s;

    &:hover { background: #F8FAFC; }
    &:last-child td { border-bottom: none; }
`;

export const IndexBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #EFF6FF;
    color: #2563EB;
    font-size: 12px;
    font-weight: 700;
    margin-right: 10px;
    flex-shrink: 0;
`;

/* ─── Radio Group (custom styled) ───────────────────────────── */
export const RadioGroup = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const RadioLabel = styled.label<{ $status: AttendanceStatus; $checked: boolean }>`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    border: 1.5px solid transparent;
    user-select: none;

    ${({ $status, $checked }) => {
        if ($status === 'PRESENT') return `
            background: ${$checked ? '#ECFDF5' : '#F8FAFC'};
            color: ${$checked ? '#059669' : '#64748B'};
            border-color: ${$checked ? '#059669' : '#E2E8F0'};
        `;
        if ($status === 'ABSENT') return `
            background: ${$checked ? '#FEF2F2' : '#F8FAFC'};
            color: ${$checked ? '#DC2626' : '#64748B'};
            border-color: ${$checked ? '#DC2626' : '#E2E8F0'};
        `;
        if ($status === 'LATE') return `
            background: ${$checked ? '#FFFBEB' : '#F8FAFC'};
            color: ${$checked ? '#D97706' : '#64748B'};
            border-color: ${$checked ? '#D97706' : '#E2E8F0'};
        `;
        return '';
    }}

    input { display: none; }

    &:hover { border-color: #94A3B8; }
`;

/* ─── Checkbox "Có phép" ─────────────────────────────────── */
export const PermissionCheck = styled.label<{ $enabled: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')};
    opacity: ${({ $enabled }) => ($enabled ? 1 : 0.35)};
    font-size: 13px;
    color: #475569;
    user-select: none;

    input { cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')}; }
`;

/* ─── Footer action bar ─────────────────────────────────── */
export const ActionBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-top: 1px solid #E2E8F0;
    gap: 12px;
    flex-wrap: wrap;
`;

export const ActionBarLeft = styled.div`
    font-size: 13px;
    color: #64748B;
`;

export const ActionBarRight = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

/* ─── Empty state ────────────────────────────────────────── */
export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 64px 24px;
    color: #94A3B8;

    svg { color: #CBD5E1; }

    p {
        margin: 0;
        font-size: 14px;
        color: #94A3B8;
        text-align: center;
        max-width: 320px;
        line-height: 1.6;
    }

    .hint {
        font-size: 12px;
        color: #CBD5E1;
    }
`;

/* ─── History Panel ──────────────────────────────────────── */
export const HistoryCard = styled.div`
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

export const HistoryHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
`;

export const HistoryTitle = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const HistoryItem = styled.div<{ $isSelected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    transition: background 0.15s;
    background: ${({ $isSelected }) => ($isSelected ? '#EFF6FF' : 'transparent')};

    &:last-child { border-bottom: none; }
    &:hover { background: ${({ $isSelected }) => ($isSelected ? '#EFF6FF' : '#F8FAFC')}; }

    .info { display: flex; flex-direction: column; gap: 2px; }
    .date { font-size: 13px; font-weight: 600; color: #0F172A; }
    .meta { font-size: 12px; color: #64748B; }
`;

export const HistoryBadges = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

export const MiniPill = styled.span<{ $color: string; $bg: string }>`
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    border-radius: 20px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
`;

/* ─── Saved success banner ───────────────────────────────── */
export const SavedBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ECFDF5;
    border: 1px solid #6EE7B7;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 13px;
    color: #059669;
    font-weight: 500;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;

/* ─── Note tag in notes column ───────────────────────────── */
export const NoteTag = styled.span`
    font-size: 12px;
    color: #64748B;
    font-style: italic;
`;
