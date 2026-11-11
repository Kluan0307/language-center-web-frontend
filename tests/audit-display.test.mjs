import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = await readFile(new URL('../src/utils/auditDisplay.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
const { readAuditRecord, auditValue } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('audit reads JSON and teacher profile records with Vietnamese names, nulls and commas', () => {
  assert.equal(readAuditRecord('{"fullName":"Minh Anh","phone":null}').fields.fullName, 'Minh Anh');
  const old = readAuditRecord('Snapshot[fullName=Nguyễn An, email=null, phone=0901, specialization=Nghe, nói, qualification=Cử nhân, experience=3 năm, certificate=B2, hireDate=2026-01-01, workStatus=ACTIVE]');
  assert.equal(old.state, 'parsed');
  assert.equal(old.fields.specialization, 'Nghe, nói');
  assert.equal(old.fields.email, null);
  assert.equal(auditValue(old.fields.workStatus), 'Đang làm việc');
});
test('audit preserves nested admission levels rather than splitting nested fields into top-level keys', () => {
  const record = readAuditRecord('Policy[id=1, mode=REQUIRES_ASSESSMENT, programName=Giao tiếp, outputLevel=Level[levelId=2, code=A2, name=A2], acceptedLevels=[Level[levelId=1, code=A1, name=A1]], reason=Xét đầu vào]');
  assert.equal(record.state, 'parsed');
  assert.equal(record.fields.programName, 'Giao tiếp');
  assert.equal(auditValue(record.fields.outputLevel), 'A2');
  assert.equal(auditValue(record.fields.acceptedLevels), 'A1');
  assert.equal(record.fields.levelId, undefined);
});
test('audit handles session records and distinguishes absent from unreadable history', () => {
  const record = readAuditRecord('date=2026-11-11; time=18:00–19:30; room=1/Phòng 1; teacher=3/Giáo viên A; status=CANCELLED; kind=REGULAR');
  assert.equal(record.fields.room, '1/Phòng 1');
  assert.equal(auditValue(record.fields.status), 'Đã hủy');
  assert.equal(readAuditRecord('').state, 'empty');
  assert.equal(readAuditRecord('NONE').state, 'empty');
  assert.equal(readAuditRecord('DEMO policy 1').state, 'unsupported');
  assert.equal(readAuditRecord('Snapshot[email=a, email=b]').state, 'unsupported');
  assert.equal(readAuditRecord('Snapshot[name=An, source=[broken]').state, 'unsupported');
  assert.equal(readAuditRecord('null').state, 'unsupported');
});
test('audit formats dates, boolean and nested JSON without exposing object notation', () => {
  assert.equal(auditValue('2026-11-11'), '11/11/2026');
  assert.equal(auditValue(false), 'Không');
  assert.equal(auditValue([{ name: 'A1' }, { code: 'A2' }]), 'A1, A2');
  assert.equal(auditValue(null), '—');
});
