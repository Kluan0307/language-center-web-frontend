import styled from 'styled-components';
export const MetricGrid=styled.div`
 display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px;
 .ant-card{height:100%;}
`;
export const TwoColumns=styled.div`
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;
 >*{min-width:0;}
 @media(max-width:1150px){grid-template-columns:minmax(0,1fr);}
`;
export const Distribution=styled.div`
 display:flex;flex-direction:column;gap:16px;
 .distribution-row{display:grid;grid-template-columns:minmax(90px,140px) minmax(0,1fr) auto;gap:12px;align-items:center;}
 .distribution-label{overflow-wrap:anywhere;}
 .ant-progress{margin:0;}
 @media(max-width:480px){.distribution-row{grid-template-columns:minmax(0,1fr) auto;}.distribution-row .ant-progress{grid-column:1/-1;grid-row:2;}}
`;
export const QuickGrid=styled.div`
 display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px;
 a{padding:16px;border:1px solid #e2e8f0;border-radius:10px;background:white;display:block;color:#0f172a;}
 a:hover{border-color:#2563eb;background:#eff6ff;}
`;
