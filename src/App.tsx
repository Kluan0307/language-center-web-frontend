import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Common';
import { NAVIGATION } from './config/navigation';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';

import { FeaturePage, StatusPage } from './pages/Feature';



















import { GlobalStyle } from './App.styles';
import { MessageGlobalStyle } from './components/Common';

const Overview = lazy(() => import('./pages/Overview'));
const StudentManagement = lazy(() => import('./pages/StudentManagement'));
const AccountManagement = lazy(() => import('./pages/AccountManagement'));
const BranchManagement = lazy(() => import('./pages/BranchManagement'));
const TeacherDirectory = lazy(() => import('./pages/TeacherDirectory'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Profile = lazy(() => import('./pages/Profile'));
const ProgramManagement = lazy(() => import('./pages/ProgramManagement'));
const CourseManagement = lazy(() => import('./pages/CourseManagement'));
const ClassManagement = lazy(() => import('./pages/ClassManagement'));
const RoomManagement = lazy(() => import('./pages/RoomManagement'));
const ScheduleManagement = lazy(() => import('./pages/ScheduleManagement'));
const EnrollmentManagement = lazy(() => import('./pages/EnrollmentManagement'));
const AttendanceManagement = lazy(() => import('./pages/AttendanceManagement'));
const LeadsPage = lazy(() => import('./pages/Leads'));
const TuitionManagement = lazy(() => import('./pages/TuitionManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const Reports = lazy(() => import('./pages/Reports'));
const ExamManagement = lazy(() => import('./pages/ExamManagement'));
const GradeManagement = lazy(() => import('./pages/GradeManagement'));
const DocumentManagement = lazy(() => import('./pages/DocumentManagement'));

function TeachersRoute() {
  const { user } = useAuth();
  return user?.role === 'STAFF' ? <TeacherDirectory /> : <AccountManagement fixedRole="TEACHER" />;
}
const PAGES: Record<string, ReactNode> = {
  dashboard: <Overview />, leads: <LeadsPage />, students: <StudentManagement />,
  branches: <BranchManagement />, administrators: <AccountManagement key="administrators" fixedRole="ADMIN" />, accounts: <AccountManagement key="accounts" />,
  teachers: <TeachersRoute />, staff: <AccountManagement key="staff" fixedRole="STAFF" />, programs: <ProgramManagement />, courses: <CourseManagement />,
  classes: <ClassManagement key="classes" />, rooms: <RoomManagement />, schedule: <ScheduleManagement key="schedule" />,
  'my-classes': <ClassManagement key="my-classes" />, 'my-schedule': <ScheduleManagement key="my-schedule" />, enrollment: <EnrollmentManagement />,
  attendance: <AttendanceManagement />, exams: <ExamManagement />, grades: <GradeManagement />, documents: <DocumentManagement />, tuition: <TuitionManagement />, payments: <PaymentManagement />, reports: <Reports />,
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={{ token: {
      colorPrimary: '#2563EB', colorSuccess: '#059669', colorWarning: '#D97706',
      colorError: '#EF4444', colorInfo: '#2563EB', borderRadius: 8, fontFamily: 'inherit',
    } }}>
      <AntdApp message={{ top: 24, duration: 3, maxCount: 3 }}>
        <BrowserRouter>
          <AuthProvider>
            <GlobalStyle /><MessageGlobalStyle />
            <Suspense fallback={<div role="status" style={{ padding: 48, textAlign: 'center' }}><Spin /><p>Đang tải trang…</p></div>}><Routes>
              <Route path="/login" element={<Login />} />
              {NAVIGATION.map((item) => (
                <Route key={item.id} element={<ProtectedRoute allowedRoles={item.roles} />}>
                  <Route path={item.path} element={PAGES[item.id] ?? <FeaturePage item={item} />} />
                </Route>
              ))}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'STAFF']} />}>
                  <Route path="/stats" element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forbidden" element={<StatusPage status="403" />} />
                <Route path="*" element={<StatusPage status="404" />} />
              </Route>
            </Routes></Suspense>
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}
export default App;

