import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Common';
import Login from './pages/Login';
import Overview from './pages/Overview';
import { GlobalStyle } from './App.styles';

const PLACEHOLDER_ROUTES = [
  '/overview',
  '/dashboard',
  '/students',
  '/teachers',
  '/courses',
  '/classes',
  '/enrollment',
  '/rooms',
  '/attendance',
  '/schedule',
  '/exams',
  '/grades',
  '/documents',
  '/tuition',
  '/reports',
  '/accounts',
  '/payments',
  '/stats',
  '/my-classes',
  '/my-schedule',
];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            {PLACEHOLDER_ROUTES.map((path) => (
              <Route key={path} path={path} element={<Overview />} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
