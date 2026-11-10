import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

async function compile(path, mocks = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } });
  const mod = { exports: {} };
  vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})', { Intl, Date, Set, Error })(
    (id) => { if (Object.hasOwn(mocks, id)) return mocks[id]; throw new Error('Unexpected dependency '+id); }, mod, mod.exports);
  return mod.exports;
}
test('phase 2 permission rules distinguish shared courses, branch courses and timetable managers', async () => {
  const { canEditCourse, canPlan } = await compile('../src/utils/academic.ts');
  assert.equal(canEditCourse('SUPER_ADMIN', { branchId: null }), true);
  assert.equal(canEditCourse('ADMIN', { branchId: null }), false);
  assert.equal(canEditCourse('STAFF', { branchId: null }), false);
  assert.equal(canEditCourse('STAFF', { branchId: 11 }), true);
  assert.equal(canEditCourse('TEACHER', { branchId: 11 }), false);
  assert.equal(canPlan('ADMIN'), true);
  assert.equal(canPlan('STAFF'), false);
  assert.equal(canPlan('TEACHER'), false);
});
test('class progress uses inclusive class dates; full remains independent', async () => {
  const { dateProgress } = await compile('../src/utils/academic.ts');
  assert.equal(dateProgress('2026-11-04', '2026-11-06', '2026-11-03'), 'UPCOMING');
  assert.equal(dateProgress('2026-11-04', '2026-11-06', '2026-11-04'), 'ONGOING');
  assert.equal(dateProgress('2026-11-04', '2026-11-06', '2026-11-06'), 'ONGOING');
  assert.equal(dateProgress('2026-11-04', '2026-11-06', '2026-11-07'), 'FINISHED');
});
test('draft slots reject duplicate weekdays and inverted/zero times', async () => {
  const { validateSlots } = await compile('../src/utils/academic.ts');
  const slot = { dayOfWeek: 'MONDAY', startTime: '18:00', endTime: '19:30' };
  assert.doesNotThrow(() => validateSlots([slot, { ...slot, dayOfWeek: 'TUESDAY' }]));
  assert.throws(() => validateSlots([slot, { ...slot, startTime: '20:00', endTime: '21:00' }]), /một buổi/);
  assert.throws(() => validateSlots([{ ...slot, endTime: '18:00' }]), /sau giờ/);
  assert.throws(() => validateSlots([{ ...slot, endTime: '17:00' }]), /sau giờ/);
});
test('class update never sends schedules while creation retains initial slots and profile IDs', async () => {
  const calls = [];
  const service = await compile('../src/services/academicService.ts', { '../api/axiosInstance': { api: {
    post: async (url, data) => { calls.push({ method: 'POST', url, data }); return { data }; },
    put: async (url, data) => { calls.push({ method: 'PUT', url, data }); return { data }; },
  } } });
  const data = { code: 'C1', teacherId: 3, teacherName: 'Teacher', schedules: [{ dayOfWeek: 'MONDAY', startTime: '18:00', endTime: '19:00' }] };
  await service.classService.save(null, data);
  await service.classService.save(10, data);
  assert.equal(calls[0].data.teacherId, 3);
  assert.equal(calls[0].data.schedules.length, 1);
  assert.equal('schedules' in calls[1].data, false);
  assert.equal(data.schedules.length, 1);
});
test('option loader collects all server pages rather than truncating at 200', async () => {
  const { collectPages } = await compile('../src/services/academicService.ts', { '../api/axiosInstance': { api: {} } });
  const pages = [];
  const result = await collectPages(async (page) => { pages.push(page); return { content: [page], totalPages: 3 }; });
  assert.deepEqual(Array.from(result), [0, 1, 2]);
  assert.deepEqual(pages, [0, 1, 2]);
});
test('option loader observes cancellation between pages', async () => {
  const { collectPages } = await compile('../src/services/academicService.ts', { '../api/axiosInstance': { api: {} } });
  const controller = new AbortController();
  let count = 0;
  await assert.rejects(collectPages(async () => {
    count++; controller.abort(); return { content: [], totalPages: 3 };
  }, controller.signal));
  assert.equal(count, 1);
});
test('phase 2 pages do not import legacy mocks or local conflict detection', async () => {
  for (const path of ['CourseManagement/index.tsx','RoomManagement/index.tsx','ClassManagement/index.tsx','ClassManagement/ClassForm.tsx','ScheduleManagement/index.tsx']) {
    const source = await readFile(new URL('../src/pages/'+path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from .*mock|checkScheduleConflict/);
  }
});
