import {useAuth} from '../../hooks/useAuth';
import TeacherDashboard from './TeacherDashboard';
import OperationsDashboard from './OperationsDashboard';
export default function Overview(){const {user}=useAuth();return user?.role==='TEACHER'?<TeacherDashboard/>:<OperationsDashboard/>;}
