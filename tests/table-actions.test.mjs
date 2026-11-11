import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = await readFile(new URL('../src/components/Common/TableActions.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023,
} });
let confirmation;
const mocks = {
  antd: { App: { useApp: () => ({ modal: { confirm: (options) => { confirmation = options; } } }) },
    Button: 'button', Dropdown: 'dropdown', Space: 'space' },
  'lucide-react': { MoreHorizontal: 'icon' },
  'react-router-dom': { Link: 'link' },
};
const module = { exports: {} };
vm.runInNewContext('(function(require,module,exports){' + outputText + '\n})', {})
  ((id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id), module, module.exports);
const TableActions = module.exports.default;
function menu(items) {
  const output = TableActions({ children: 'View', items });
  return output.props.children[1];
}
const event = () => ({ domEvent: { stopPropagation() {} } });

test('secondary actions keep callbacks while dangerous actions wait for confirmation', async () => {
  let calls = 0;
  const options = { title: 'Delete?', okText: 'Delete', cancelText: 'Cancel', onOk: async () => { calls++; } };
  const dropdown = menu([{ key: 'edit', label: 'Edit', onClick: () => calls++ },
    { key: 'delete', label: 'Delete', danger: true, confirm: options }]);
  const items = dropdown.props.menu.items;
  items[0].onClick(event());
  assert.equal(calls, 1);
  items[1].onClick(event());
  assert.equal(calls, 1);
  assert.equal(confirmation, options);
  assert.equal(items[1].danger, true);
  await confirmation.onOk();
  assert.equal(calls, 2);
});

test('disabled and loading menu actions cannot execute or navigate', () => {
  let calls = 0;
  const items = menu([
    { key: 'disabled', label: 'Edit', disabled: true, onClick: () => calls++ },
    { key: 'busy', label: 'Retry', loading: true, to: '/tuition', onClick: () => calls++ },
  ]).props.menu.items;
  for (const item of items) { assert.equal(item.disabled, true); item.onClick(event()); }
  assert.equal(items[1].label, 'Retry');
  assert.equal(calls, 0);
});

test('menu preserves route links and is omitted when no secondary action is permitted', () => {
  const item = menu([{ key: 'receipt', label: 'Receipts', to: '/payments?tuitionId=1' }]).props.menu.items[0];
  assert.equal(item.label.type, 'link');
  assert.equal(item.label.props.to, '/payments?tuitionId=1');
  const empty = TableActions({ children: 'View', items: [] });
  assert.equal(empty.props.children[0], 'View');
  assert.equal(empty.props.children[1], false);
});
