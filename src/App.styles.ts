import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .ant-drawer-body, .ant-modal-body { overflow-wrap: anywhere; }
  .ant-drawer-body .ant-descriptions-item-content { min-width:0; overflow-wrap:anywhere; }
  .ant-table-wrapper { max-width:100%; }
  .ant-select { max-width:100%; }
  :focus-visible { outline:2px solid #2563eb;outline-offset:3px; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
  }
`;