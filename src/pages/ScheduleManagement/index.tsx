import {useSearchParams} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import WeeklySchedule from './WeeklySchedule';
import SessionManagement from '../SessionManagement';
export default function ScheduleManagement(){const [params]=useSearchParams();const {user}=useAuth();return params.get('view')==='weekly'&&(user?.role==='ADMIN'||user?.role==='SUPER_ADMIN')?<WeeklySchedule/>:<SessionManagement/>;}
