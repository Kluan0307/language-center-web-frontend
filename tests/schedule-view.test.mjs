import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const source = await readFile(new URL('../src/utils/scheduleView.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } });
const state = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

test('calendar ranges start Monday and cross year/leap-day boundaries without local timezone shifts', () => {
  assert.deepEqual(state.scheduleRange('2027-01-01', 'week'), { from: '2026-12-28', to: '2027-01-03' });
  assert.deepEqual(state.scheduleRange('2026-11-11', 'day'), { from: '2026-11-11', to: '2026-11-11' });
  assert.equal(state.shiftScheduleDate('2028-02-28', 1), '2028-02-29');
});
test('calendar URL restores every filter and keeps independent list dates', () => {
  const params = new URLSearchParams('display=list&calendarView=day&date=2026-12-05&classId=2&teacherId=3&roomId=4&branchId=1&status=CANCELLED&page=2&size=20&from=2026-11-01&to=2026-11-30');
  const result = state.readScheduleState(params, '2026-11-11');
  assert.equal(result.date, '2026-12-05'); assert.equal(result.calendarView, 'day');
  assert.equal(result.query.teacherId, 3); assert.equal(result.roomId, 4);
  const next = state.updateScheduleParams(params, { display: 'calendar', classId: undefined });
  assert.equal(next.get('from'), '2026-11-01'); assert.equal(next.get('roomId'), '4');
  assert.equal(next.has('classId'), false); assert.equal(params.get('classId'), '2');
});
test('invalid URL dates and IDs are rejected while explicitly cleared dates remain cleared', () => {
  const result = state.readScheduleState(new URLSearchParams('date=2026-02-31&classId=-1&roomId=NaN&status=HACK&page=-2&size=999&from=&to='), '2026-11-11', 'day');
  assert.equal(result.date, '2026-11-11'); assert.equal(result.calendarView, 'day');
  assert.equal(result.query.classId, undefined); assert.equal(result.roomId, undefined);
  assert.equal(result.query.status, undefined); assert.equal(result.query.page, 0); assert.equal(result.query.size, 10);
  assert.equal(result.query.from, undefined); assert.equal(result.query.to, undefined);
});
async function loader() {
  const calls = [];
  const service = {
    list: async query => { calls.push({ method: 'list', query }); return { content: [{ id: 1 }], totalElements: 1, totalPages: 1, page: 0, size: 10 }; },
    all: async query => { calls.push({ method: 'all', query }); return [{ id: 1, roomId: 1 }, { id: 2, roomId: 2 }, { id: 3, roomId: 1 }, { id: 4, roomId: 1 }]; },
  };
  const raw = await readFile(new URL('../src/pages/SessionManagement/scheduleData.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(raw, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext('(function(require,module,exports){' + compiled + '\n})', {})
    (id => id.endsWith('sessionService') ? { sessionService: service } : id.endsWith('scheduleView') ? state : require(id), module, module.exports);
  return { load: module.exports.loadSchedule, calls };
}
const input = { display: 'calendar', date: '2026-11-11', calendarView: 'week', revision: 0,
  query: { page: 0, size: 10, teacherId: 3, from: '2026-12-31', to: '2026-01-01' } };

test('calendar makes only the complete-range request and ignores invalid list-only date limits', async () => {
  const { load, calls } = await loader();
  const result = await load(input);
  assert.equal(calls.length, 1); assert.equal(calls[0].method, 'all');
  assert.equal(calls[0].query.from, '2026-11-09'); assert.equal(calls[0].query.to, '2026-11-15');
  assert.equal(calls[0].query.teacherId, 3); assert.equal(calls[0].query.page, undefined);
  assert.equal(result.totalElements, 4);
});
test('invalid list range makes no session request', async () => {
  const { load, calls } = await loader();
  const result = await load({ ...input, display: 'list' });
  assert.equal(calls.length, 0); assert.equal(result.totalElements, 0);
});
test('normal list uses server pagination without fetching the entire range', async () => {
  const { load, calls } = await loader();
  await load({ ...input, display: 'list', query: { ...input.query, from: '2026-11-01', to: '2026-11-30' } });
  assert.equal(calls.length, 1); assert.equal(calls[0].method, 'list'); assert.equal(calls[0].query.size, 10);
});
test('room list filters the entire authorized range before pagination and keeps all room options', async () => {
  const { load, calls } = await loader();
  const result = await load({ ...input, display: 'list', roomId: 1, query: { ...input.query, page: 1, size: 2, from: '2026-11-01', to: '2026-11-30' } });
  assert.equal(calls.length, 1); assert.equal(calls[0].method, 'all');
  assert.equal(calls[0].query.roomId, undefined); assert.equal(result.totalElements, 3); assert.equal(result.totalPages, 2);
  assert.equal(result.content.length, 1); assert.equal(result.content[0].id, 4); assert.equal(result.options.length, 4);
});
