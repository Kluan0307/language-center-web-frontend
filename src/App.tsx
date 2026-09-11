import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Common';
import Login from './pages/Login';
import Overview from './pages/Overview';
import { GlobalStyle } from './App.styles';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<Overview />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
