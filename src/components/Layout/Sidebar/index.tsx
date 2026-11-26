import { useState } from 'react';
import { Drawer,Dropdown } from 'antd';
import { NavLink,useLocation,useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon, LayoutDashboard, LogOut, Building2, UserPlus, Users, GraduationCap, UserCheck,
  BookOpen, School, ClipboardList, DoorOpen, CalendarCheck, CalendarDays, FileText,
  Award, BarChart3, ShieldCheck, ClipboardCheck, CreditCard, Receipt, CalendarClock,
  BookMarked, Building2 as BuildingComplex, CircleQuestionMark, Settings, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  getNavigationGroups, getItemLabel, type NavigationIcon,
} from '../../../config/navigation';
import * as S from './Sidebar.styles';
import Topbar from './Topbar';

const ICONS: Record<NavigationIcon, LucideIcon> = {
  dashboard: LayoutDashboard, branch: Building2, accounts: ShieldCheck,
  leads: UserPlus, students: Users, teachers: GraduationCap, staff: UserCheck,
  courses: BookOpen, classes: School, rooms: DoorOpen, schedule: CalendarDays,
  enrollment: ClipboardList, attendance: CalendarCheck, exams: ClipboardCheck,
  grades: Award, documents: FileText, tuition: CreditCard, payments: Receipt,
  reports: BarChart3, myClasses: BookMarked, mySchedule: CalendarClock,
};

function FooterUtilities({onNavigate}:{onNavigate:()=>void}){
 const {user,logout}=useAuth();const location=useLocation();const navigate=useNavigate();const [expanded,setExpanded]=useState(false);
 const manager=user?.role==='SUPER_ADMIN'||user?.role==='ADMIN';
 const items=[...(manager?[{key:'/website-content',label:"Nội dung website",icon:<BookOpen size={17} aria-hidden="true"/>}]:[]),
 {key:'/company',label:"Công ty",icon:<BuildingComplex size={17} aria-hidden="true"/>},
 {key:'/help',label:"Hỗ trợ",icon:<CircleQuestionMark size={17} aria-hidden="true"/>},
 {key:'/settings',label:"Cài đặt",icon:<Settings size={17} aria-hidden="true"/>},
 {key:'divider',type:'divider' as const},
 {key:'logout',label:'Đăng xuất',icon:<LogOut size={17} aria-hidden="true"/>,danger:true}];
 return <Dropdown trigger={['click']} placement="topLeft" open={expanded} onOpenChange={setExpanded} menu={{items,selectedKeys:[location.pathname],onClick:({key})=>{setExpanded(false);onNavigate();if(key==='logout')logout();else navigate(key);}}}>
  <S.FooterItem type="button" aria-label="Mở menu tiện ích" aria-haspopup="menu" aria-expanded={expanded} className={items.some(item=>item.key===location.pathname)?'active':undefined}><MenuIcon size={20} aria-hidden="true"/><span>Thêm</span></S.FooterItem>
 </Dropdown>;
}

function Sidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const role = user?.role;
  const groups = role ? getNavigationGroups(role) : [];
  const content = (<>
      <S.SidebarTop>
        <S.Brand as={NavLink} to="/dashboard" onClick={()=>setOpen(false)} aria-label="Language Center · Trang tổng quan"><img src="/brand/logo.svg" alt=""/><span>LANGUAGE CENTER<small>ENGLISH EDUCATION</small></span></S.Brand>
        <S.Menu aria-label="Điều hướng chính">
          {groups.map((group) => (
            <S.MenuGroup key={group.label || 'overview'}>
              {group.label && <S.GroupLabel>{group.label}</S.GroupLabel>}
              <ul>
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <li key={item.id}>
                      <NavLink to={item.path} end onClick={() => setOpen(false)}>
                        <span className="icon"><Icon size={18} aria-hidden="true" /></span>
                        <span>{getItemLabel(item, role!)}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </S.MenuGroup>
          ))}
        </S.Menu>
      </S.SidebarTop>
      <S.SidebarBottom><FooterUtilities onNavigate={()=>setOpen(false)}/></S.SidebarBottom>
    </>);
  return (<>
    <Topbar open={open} onMenu={()=>setOpen(true)}/>
    <S.DesktopSlot><S.SidebarContainer>{content}</S.SidebarContainer></S.DesktopSlot>
    <Drawer id="mobile-navigation" title="Điều hướng" placement="left" size={280} open={open} onClose={()=>setOpen(false)}
      styles={{body:{display:'flex',flexDirection:'column',padding:14,overflow:'hidden'}}}>{content}</Drawer>
  </>);
}
export default Sidebar;
