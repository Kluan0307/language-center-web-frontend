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

  body {
    font-family: system-ui, -apple-system, sans-serif;
  }
`;