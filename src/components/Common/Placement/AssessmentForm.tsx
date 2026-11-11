import { useState } from "react";
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useRemoteResource } from "../../../hooks/useRemoteResource";
import { useFormLeaveGuard } from "../../../hooks/useFormLeaveGuard";
import {
  programService,
  assessmentService,
} from "../../../services/placementService";
import { businessDate } from "../../../utils/academic";
import { getErrorMessage, applyFormErrors } from "../../../utils/apiErrors";
import type { Assessment, AssessmentDraft } from "../../../types/placement";
type Values = Omit<AssessmentDraft, "assessedOn"> & { assessedOn: Dayjs };
export default function AssessmentForm({
  studentId,
  editing,
  copy,
  onClose,
  onSaved,
}: {
  studentId: number;
  editing: Assessment | null;
  copy?: Assessment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm<Values>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = useFormLeaveGuard(busy, onClose);
  const programs = useRemoteResource(programService.list, {});
  const programId = Form.useWatch("programId", form) as number | undefined;
  const method = Form.useWatch("method", form);
  const levels = useRemoteResource(programService.levels, {
    id: programId ?? null,
  });
  const source = editing ?? copy;
  async function save(v: Values) {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      await assessmentService.save(studentId, editing?.id ?? null, {
        ...v,
        version: editing?.version,
        assessedOn: v.assessedOn.format("YYYY-MM-DD"),
        score: v.score ?? null,
        maxScore: v.maxScore ?? null,
      });
      onSaved();
    } catch (e) {
      applyFormErrors(form, e);
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      title={editing ? "Sửa bản nháp đánh giá" : "Ghi nhận đánh giá đầu vào"}
      width={800}
      okText="Lưu bản nháp"
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={leave.cancel}
      confirmLoading={busy}
      closable={!busy}
      maskClosable={!busy}
      cancelButtonProps={{ disabled: busy }}
    >
      <Alert
        type="info"
        showIcon
        title="Lưu bản nháp trước, xác nhận nguồn sau."
        description={
          copy
            ? "Đang tạo bản thay thế từ dữ liệu cũ. Kiểm tra lại ngày, người đánh giá và nguồn; không ghi đè kết quả hiện hành."
            : "Chọn trình độ theo kết luận của người đánh giá và ghi rõ căn cứ."
        }
      />
      {error && <Alert type="error" showIcon title={error} />}{" "}
      {(programs.error || levels.error) && (
        <Alert
          type="error"
          title={programs.error ?? levels.error}
          action={
            <Button
              onClick={() => {
                programs.reload();
                levels.reload();
              }}
            >
              Thử lại
            </Button>
          }
        />
      )}
      <Form<Values>
        name="placementAssessment"
        form={form}
        layout="vertical"
        initialValues={
          source
            ? { ...source, assessedOn: dayjs(source.assessedOn) }
            : { method: "INTERVIEW", assessedOn: dayjs(businessDate()) }
        }
        disabled={busy}
        onValuesChange={(v) => {
          leave.changed();
          if ("programId" in v) form.setFieldValue("levelId", undefined);
        }}
        onFinish={save}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="programId"
              label="Chương trình"
              rules={[{ required: true, message: "Chọn chương trình." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={programs.loading}
                options={programs.data?.map((p) => ({
                  value: p.id,
                  label: p.code + " · " + p.name,
                  disabled: !p.active,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="levelId"
              label="Kết quả trình độ đã đánh giá"
              rules={[
                { required: true, message: "Chọn trình độ cùng chương trình." },
              ]}
            >
              <Select
                disabled={!programId}
                showSearch
                optionFilterProp="label"
                loading={levels.loading}
                options={levels.data
                  ?.filter((l) => l.active)
                  .map((l) => ({
                    value: l.id,
                    label: l.code + " · " + l.name,
                  }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="method"
              label="Phương thức"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "TEST", label: "Bài kiểm tra" },
                  { value: "INTERVIEW", label: "Phỏng vấn" },
                  { value: "CERTIFICATE", label: "Chứng chỉ" },
                  { value: "OTHER", label: "Nguồn khác" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="assessedOn"
              label="Ngày đánh giá"
              rules={[{ required: true }]}
            >
              <DatePicker
                disabledDate={(d) => d.format("YYYY-MM-DD") > businessDate()}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="score"
              label="Điểm (bắt buộc với bài kiểm tra)"
              rules={
                method === "TEST"
                  ? [{ required: true, message: "Nhập điểm, có thể bằng 0." }]
                  : []
              }
            >
              <InputNumber
                min={0}
                max={99999999.9999}
                precision={4}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxScore"
              label="Thang điểm dương"
              rules={
                method === "TEST"
                  ? [{ required: true, message: "Nhập thang điểm." }]
                  : []
              }
            >
              <InputNumber
                min={0.0001}
                max={99999999.9999}
                precision={4}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="assessorName"
              label="Người / đơn vị đánh giá"
              rules={[{ required: true, whitespace: true }, { max: 255 }]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="source"
              label="Nguồn / căn cứ đối chiếu"
              rules={[{ required: true, whitespace: true }, { max: 2000 }]}
            >
              <Input.TextArea
                maxLength={2000}
                rows={3}
                placeholder="Ví dụ: biên bản phỏng vấn, mã bài kiểm tra, thông tin chứng chỉ đã đối chiếu"
              />
            </Form.Item>
          </Col>
          {editing && (
            <Col span={24}>
              <Form.Item
                name="reason"
                label="Lý do sửa bản nháp"
                rules={[
                  { required: true, whitespace: true },
                  { min: 3, max: 500 },
                ]}
              >
                <Input.TextArea maxLength={500} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}
