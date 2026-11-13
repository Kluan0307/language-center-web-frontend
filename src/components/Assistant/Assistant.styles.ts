import styled from 'styled-components';

export const Launcher = styled.div`
  position: fixed; right: 24px; bottom: 24px; z-index: 990;
  button { height: 46px; padding-inline: 18px; box-shadow: 0 6px 24px #1e40af24; border-radius: 24px; }
  @media(max-width: 600px) { right: 14px; bottom: 14px; button { height: 42px; } }
`;
export const Title = styled.div`display:flex;gap:10px;align-items:center; strong { display:block; font-size:16px; } small { color:#64748b; font-weight:400; }`;
export const Shell = styled.div`display:flex;flex-direction:column;height:100%;min-height:0;background:#f8fafc;`;
export const Scope = styled.div`padding:14px 20px;background:#fff;border-bottom:1px solid #e2e8f0;display:grid;gap:10px; .ant-select { width:100%; } p { margin:0;color:#64748b;font-size:12px; }`;
export const History = styled.div`flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:20px;display:flex;flex-direction:column;gap:20px;`;
export const Welcome = styled.div`padding:24px 0;h2 { font-size:22px;letter-spacing:-.4px;margin:12px 0 8px;color:#0f172a; } p { color:#64748b;line-height:1.7; } button { display:block;width:100%;height:auto;text-align:left;white-space:normal;margin:8px 0;padding:12px; }`;
export const Question = styled.div`background:#2563eb;color:white;padding:12px 16px;border-radius:16px 16px 4px 16px;max-width:90%;margin-left:auto;white-space:pre-wrap;overflow-wrap:anywhere;`;
export const Answer = styled.div`display:grid;gap:12px;margin-top:14px;line-height:1.65;overflow-wrap:anywhere; .answer-text { margin:0;white-space:pre-wrap; }`;
export const Result = styled.section`border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:14px; min-width:0; h4 { margin:0 0 10px;font-size:14px;color:#0f172a; } dl { margin:0;display:grid;grid-template-columns:minmax(90px,1fr) minmax(0,1.6fr);gap:6px 14px;font-size:13px; } dt { color:#64748b; } dd { margin:0;overflow-wrap:anywhere; } .result-row + .result-row { border-top:1px solid #f1f5f9;margin-top:12px;padding-top:12px; } .result-name { font-weight:600;margin-bottom:7px; } .ant-btn { margin-top:8px; }`;
export const Composer = styled.div`padding:14px 20px 16px;background:#fff;border-top:1px solid #e2e8f0;display:grid;gap:10px; .ant-input { resize:none; } .compose-actions { display:flex;justify-content:space-between;align-items:center;gap:12px; } small { color:#64748b;font-size:12px; }`;
export const Source = styled.div`font-size:11px;color:#64748b;line-height:1.6;`;
