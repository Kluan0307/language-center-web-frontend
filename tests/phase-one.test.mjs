import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);

async function moduleUnderTest(path, overrides = {}, mocks = {}) {
  const code = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(code, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023,
  } });
  const mod = { exports: {} };
  vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})', overrides)(
    (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id), mod, mod.exports);
  return mod.exports;
}
test('account actions enforce branch, role, self and Super Admin restrictions', async () => {
  const { canManageAccount, creatableRoles } = await moduleUnderTest('../src/utils/accountPermissions.ts');
  const admin = { accountId: 1, role: 'ADMIN', branchId: 11 };
  assert.equal(canManageAccount(admin, { accountId: 2, role: 'STAFF', branchId: 11 }), true);
  assert.equal(canManageAccount(admin, { accountId: 2, role: 'TEACHER', branchId: 12 }), false);
  assert.equal(canManageAccount(admin, { accountId: 3, role: 'ADMIN', branchId: 11 }), false);
  assert.equal(canManageAccount(admin, admin), false);
  assert.equal(canManageAccount({ ...admin, branchId: null }, { accountId: 2, role: 'STAFF', branchId: null }), false);
  const superAdmin = { accountId: 4, role: 'SUPER_ADMIN', branchId: null };
  assert.equal(canManageAccount(superAdmin, admin), true);
  assert.equal(canManageAccount(superAdmin, superAdmin), false);
  assert.equal(canManageAccount({ ...admin, role: 'STAFF' }, { accountId: 2, role: 'TEACHER', branchId: 11 }), false);
  assert.deepEqual(Array.from(creatableRoles('ADMIN')), ['STAFF', 'TEACHER']);
  assert.deepEqual(Array.from(creatableRoles('SUPER_ADMIN')), ['ADMIN', 'STAFF', 'TEACHER']);
  assert.equal(creatableRoles('TEACHER').length, 0);
});

function makeStorage() {
  const map = new Map();
  return { getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)), removeItem: (key) => map.delete(key) };
}
async function sessionModule() {
  const localStorage = makeStorage(), sessionStorage = makeStorage(), window = new EventTarget();
  const module = await moduleUnderTest('../src/utils/authStorage.ts', { localStorage, sessionStorage, window, Event, atob });
  return { ...module, localStorage, sessionStorage, window };
}
test('remember me chooses persistent or per-tab storage and clears old credentials', async () => {
  const state = await sessionModule();
  let events = 0;
  const stop = state.subscribeSession(() => events++);
  state.localStorage.setItem('user', 'old cached role');
  state.saveSession('tab-token', false);
  assert.equal(state.sessionStorage.getItem('token'), 'tab-token');
  assert.equal(state.localStorage.getItem('token'), null);
  assert.equal(state.localStorage.getItem('user'), null);
  state.saveSession('persistent-token', true);
  assert.equal(state.localStorage.getItem('token'), 'persistent-token');
  assert.equal(state.sessionStorage.getItem('token'), null);
  state.clearSession();
  assert.equal(state.getSessionToken(), null);
  assert.equal(events, 3);
  stop();
  state.saveSession('after-unsubscribe', false);
  assert.equal(events, 3);
});
test('expiry parsing rejects malformed claims and preserves exact expiry', async () => {
  const state = await sessionModule();
  assert.equal(state.tokenExpiresAt('broken'), null);
  assert.equal(state.tokenExpiresAt('x.' + Buffer.from('{}').toString('base64url') + '.y'), null);
  assert.equal(state.tokenExpiresAt('x.' + Buffer.from(JSON.stringify({ exp: 2000000000 })).toString('base64url') + '.y'), 2000000000000);
});
test('only an unauthorized request for the current session expires it', async () => {
  const axios = require('axios');
  let token = 'new-token', clears = 0;
  // import.meta.env is supplied by Vite; replace it only for this isolated Node test.
  let source = await readFile(new URL('../src/api/axiosInstance.ts', import.meta.url), 'utf8');
  source = source.replace('import.meta.env.VITE_API_BASE_URL', "'http://localhost:8080/api/v1'");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } });
  const mod = { exports: {} };
  vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})', {})(
    (id) => id === '../utils/accountSecurity' ? {PASSWORD_REFRESH_EVENT:'language-center:refresh-session'} : id === '../utils/branchScope' ? {getActiveBranch:()=>null} : id === '../utils/authStorage' ? { getSessionToken: () => token, clearSession: () => { clears++; } } : require(id),
    mod, mod.exports);
  const { api } = mod.exports;
  api.defaults.adapter = async (config) => { throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null,
    { status: 401, data: {}, headers: {}, statusText: 'Unauthorized', config }); };
  await assert.rejects(api.get('/auth/me', { headers: { Authorization: 'Bearer old-token' } }));
  assert.equal(clears, 0);
  await assert.rejects(api.post('/auth/login', {}));
  assert.equal(clears, 0);
  await assert.rejects(api.get('/auth/me'));
  assert.equal(clears, 1);
  api.defaults.adapter = async (config) => { throw new axios.AxiosError('Unavailable', 'ERR_BAD_RESPONSE', config, null,
    { status: 503, data: {}, headers: {}, statusText: 'Unavailable', config }); };
  await assert.rejects(api.get('/auth/me'));
  assert.equal(clears, 1);
  token = null;
});
test('network and field-validation errors remain actionable', async () => {
  const axios = require('axios');
  const { getErrorMessage, applyFormErrors } = await moduleUnderTest('../src/utils/apiErrors.ts');
  assert.match(getErrorMessage(new axios.AxiosError('Network Error')), /Không kết nối/);
  const error = new axios.AxiosError('Bad request', 'ERR_BAD_REQUEST', {}, null,
    { status: 400, data: { username: 'Tên đăng nhập không hợp lệ' } });
  const fields = [];
  applyFormErrors({ setFields: (items) => fields.push(...items) }, error);
  assert.equal(fields[0].name, 'username');
  assert.equal(fields[0].errors[0], 'Tên đăng nhập không hợp lệ');
});
