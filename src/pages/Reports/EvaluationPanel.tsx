import { useState } from "react";
import { Select, Space } from "antd";
import { LoadError } from "../../components/Common/Academic";
import { useRemoteResource } from "../../hooks/useRemoteResource";
import { classService } from "../../services/academicService";
import EvaluationWorkspace from "../../components/Common/Evaluation/EvaluationWorkspace";
export default function EvaluationPanel({ branchId }: { branchId?: number }) {
  const [classId, setClassId] = useState<number>();
  const classes = useRemoteResource(classService.all, { branchId });
  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Select
        aria-label="Lớp đánh giá"
        style={{ minWidth: 260, maxWidth: "100%" }}
        placeholder="Chọn lớp để xem đánh giá tạm"
        allowClear
        showSearch
        optionFilterProp="label"
        value={classId}
        loading={classes.loading}
        options={classes.data?.map((c) => ({
          value: c.id,
          label: c.code + " · " + c.name,
        }))}
        onChange={setClassId}
      />
      <LoadError error={classes.error} reload={classes.reload} />
      {classId && (
        <EvaluationWorkspace
          key={classId}
          classId={classId}
          canConfigure={false}
        />
      )}
    </Space>
  );
}
