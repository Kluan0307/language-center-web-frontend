import { Card } from 'antd';
import { ManagementLayout } from '../../components/Layout/ManagementLayout';
import ProgramCatalog from '../../components/Common/Placement/ProgramCatalog';
export default function ProgramManagement() {
  return <ManagementLayout title="Chương trình & trình độ" description="Danh mục chương trình đào tạo và các trình độ tương ứng.">
    <Card><ProgramCatalog embedded onClose={() => {}} onChanged={() => {}} /></Card>
  </ManagementLayout>;
}
