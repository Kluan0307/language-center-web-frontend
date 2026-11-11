import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/config/navigation.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023,
} });
const navigation = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const { NAVIGATION, ROLES, getNavigation, getNavigationGroups, canAccess, isRole, getItemLabel } = navigation;
const expected = {
  SUPER_ADMIN: ['dashboard','branches','administrators','accounts','teachers','staff','leads','students','courses','classes','rooms','schedule','enrollment','attendance','exams','grades','documents','tuition','payments','reports'],
  ADMIN: ['dashboard','accounts','teachers','staff','leads','students','courses','classes','rooms','schedule','enrollment','attendance','exams','grades','documents','tuition','payments','reports'],
  STAFF: ['dashboard','teachers','leads','students','courses','classes','rooms','schedule','enrollment','attendance','documents','tuition','payments'],
  TEACHER: ['dashboard','my-classes','my-schedule','attendance','exams','grades','documents'],
};
for (const role of ROLES) {
  test(role + ': exact menu and direct-route access matrix', () => {
    assert.deepEqual(getNavigation(role).map((item) => item.id), expected[role]);
    for (const item of NAVIGATION) {
      assert.equal(canAccess(item, role), expected[role].includes(item.id), item.path);
    }
    const grouped = getNavigationGroups(role).flatMap((group) => group.items);
    assert.deepEqual(grouped.map((item) => item.id).sort(), [...expected[role]].sort());
  });
}
test('unknown roles fail closed', () => {
  for (const role of [null, undefined, '', 'ACCOUNTANT', 'admin']) {
    assert.equal(isRole(role), false);
    assert.deepEqual(getNavigation(role), []);
    assert.ok(NAVIGATION.every((item) => !canAccess(item, role)));
  }
});
test('routes and ids are unique and every menu has an allowed role', () => {
  assert.equal(new Set(NAVIGATION.map((item) => item.id)).size, NAVIGATION.length);
  assert.equal(new Set(NAVIGATION.map((item) => item.path)).size, NAVIGATION.length);
  for (const item of NAVIGATION) {
    assert.ok(item.path.startsWith('/'));
    assert.ok(item.roles.length > 0);
    assert.ok(item.roles.every(isRole));
  }
});
test('teacher labels do not promise administrative evaluation or document browsing', () => {
  assert.equal(getItemLabel(NAVIGATION.find((item) => item.id === 'grades'), 'TEACHER'), 'Bảng điểm');
  assert.equal(getItemLabel(NAVIGATION.find((item) => item.id === 'documents'), 'TEACHER'), 'Tài liệu của tôi');
});
test('App route roles come from the same configuration as the sidebar', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /NAVIGATION\.map/);
  assert.match(app, /ProtectedRoute allowedRoles=\{item.roles\}/);
  assert.match(app, /path=\"\/forbidden\"/);
  assert.match(app, /path=\"\*\"/);
});

import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter, Navigate, Outlet } = require('react-router-dom');

async function loadTsx(relativePath, mocks) {
  const sourceText = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(sourceText, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023,
  } });
  const module = { exports: {} };
  vm.runInNewContext('(function(require,module,exports){' + outputText + '\n})', {})
    ((id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id), module, module.exports);
  return module.exports;
}
const styleTags = { DesktopSlot: 'div', MobileBar: 'div', SidebarContainer: 'aside', SidebarTop: 'div', Header: 'header',
  AvatarWrapper: 'div', InfoWrapper: 'div', UserName: 'p', UserRole: 'p', Menu: 'nav',
  MenuGroup: 'section', GroupLabel: 'p', SidebarBottom: 'footer', LogoutButton: 'button' };
const sidebarStyles = Object.fromEntries(Object.entries(styleTags).map(([key, tag]) => [
  key, ({ children, ...props }) => React.createElement(tag, props, children),
]));
for (const role of ROLES) {
  test(role + ': rendered sidebar contains exactly the authorized links', async () => {
    const { default: Sidebar } = await loadTsx('../src/components/Layout/Sidebar/index.tsx', {
      '../../../hooks/useAuth': { useAuth: () => ({
        user: { role, username: role.toLowerCase(), branchId: role === 'SUPER_ADMIN' ? null : 11 },
        logout() {},
      }) },
      '../../../config/navigation': navigation,
      '../../../assets/images/avatar-default.png': { default: 'avatar.png' },
      './Sidebar.styles': sidebarStyles,
      './BranchSwitcher': {__esModule:true,default:()=>null},
    });
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/dashboard'] },
      React.createElement(Sidebar)));
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(links.sort(), getNavigation(role).map((item) => item.path).sort());
    assert.ok(html.includes(navigation.ROLE_LABELS[role]));
    assert.ok(html.includes('aria-current="page"'));
    assert.ok(html.includes(role === 'SUPER_ADMIN' ? 'Phạm vi: toàn hệ thống' : 'Chi nhánh #11'));
  });
}
test('route guard: signed out, loading, forbidden, allowed and unknown role', async () => {
  let session = { isAuthenticated: false, isLoading: false, user: null };
  const { ProtectedRoute } = await loadTsx('../src/components/Common/ProtectedRoute/index.tsx', {
    '../../../hooks/useAuth': { useAuth: () => session },
    '../../../config/navigation': navigation,
    'react-router-dom': { Navigate, Outlet, useLocation: () => ({ pathname: '/accounts' }) },
    antd: { Spin: 'loading-spinner' },
  });
  assert.equal(ProtectedRoute({}).props.to, '/login');
  session = { isAuthenticated: false, isLoading: true, user: null };
  assert.equal(ProtectedRoute({}).type, 'loading-spinner');
  session = { isAuthenticated: true, isLoading: false, user: { role: 'STAFF' } };
  const denied = ProtectedRoute({ allowedRoles: ['SUPER_ADMIN', 'ADMIN'] });
  assert.equal(denied.type, Navigate);
  assert.equal(denied.props.to, '/forbidden');
  assert.equal(denied.props.state.from, '/accounts');
  session.user.role = 'ADMIN';
  assert.equal(ProtectedRoute({ allowedRoles: ['SUPER_ADMIN', 'ADMIN'] }).type, Outlet);
  session.user.role = 'ACCOUNTANT';
  assert.equal(ProtectedRoute({}).props.to, '/login');
});
