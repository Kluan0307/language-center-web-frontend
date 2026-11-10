import { Alert, Button, Card, Result, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { getItemDescription, getItemLabel, type NavigationItem } from '../../config/navigation';
import * as S from '../Overview/Overview.styles';

export function FeaturePage({ item }: { item: NavigationItem }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <S.OverviewContainer>
      <Sidebar />
      <S.MainContent>
        <Typography.Title level={2}>{getItemLabel(item, user.role)}</Typography.Title>
        <Card>
          <Typography.Paragraph>{getItemDescription(item, user.role)}</Typography.Paragraph>
          <Alert type="info" showIcon title="Chức năng đang được triển khai"
            description="Mục điều hướng và quyền truy cập đã được thiết lập. Màn hình nghiệp vụ và kết nối dữ liệu sẽ được bổ sung ở đợt tiếp theo." />
        </Card>
      </S.MainContent>
    </S.OverviewContainer>
  );
}
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
