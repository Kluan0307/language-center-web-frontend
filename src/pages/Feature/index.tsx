import {Button,Result} from 'antd';
import {Link,useLocation} from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import * as S from '../Overview/Overview.styles';
export function StatusPage({ status }: { status: '403' | '404' }) {
  const location = useLocation();
  const from: unknown = location.state?.from;
  return (
    <S.OverviewContainer>
      <Sidebar />
      <S.MainContent>
        <Result status={status}
          title={status === '403' ? 'Bạn không có quyền truy cập' : 'Không tìm thấy trang'}
          subTitle={status === '403'
            ? `Chức năng${typeof from === 'string' ? ` ${from}` : ''} không thuộc quyền của tài khoản này.`
            : 'Đường dẫn không tồn tại.'}
          extra={<Link to="/dashboard"><Button type="primary">Về tổng quan</Button></Link>} />
      </S.MainContent>
    </S.OverviewContainer>
  );
}
