import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../src/pages/OnlinePayments/query.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023}});
const module={exports:{}};
vm.runInNewContext('(function(module,exports){'+outputText+'\n})',{URLSearchParams})(module,module.exports);
const {readOnlineQuery:read,patchOnlineQuery:patch}=module.exports;
test('opening and closing a payment drawer preserves list and unrelated URL context',()=>{
 const initial=new URLSearchParams('branchId=7&state=PENDING&page=3&size=20&tab=orders&studentId=15');
 const opened=patch(initial,{orderId:'uuid-full-value'});
 assert.equal(opened.get('orderId'),'uuid-full-value');
 const closed=patch(opened,{orderId:undefined});
 assert.equal(closed.toString(),initial.toString());
 assert.equal(initial.has('orderId'),false);
});
test('invalid URL numbers, statuses and tabs fall back to bounded defaults',()=>{
 const q=read(new URLSearchParams('page=-1&size=100000&state=ADMIN&branchId=9007199254740993&tab=hack&eventPage=1.5'));
 assert.equal(q.page,0);assert.equal(q.size,10);assert.equal(q.state,undefined);assert.equal(q.branchId,undefined);assert.equal(q.tab,'orders');assert.equal(q.eventPage,0);
});
test('switching tabs and event pages preserves order filters and pagination',()=>{
 const p=patch(new URLSearchParams('state=REVIEW_REQUIRED&page=4&size=50&branchId=3'),{tab:'events',eventPage:2});
 const q=read(p);assert.equal(q.tab,'events');assert.equal(q.eventPage,2);assert.equal(q.page,4);assert.equal(q.size,50);assert.equal(q.state,'REVIEW_REQUIRED');assert.equal(q.branchId,3);
 const cleared=patch(p,{state:undefined,page:0});assert.equal(cleared.get('branchId'),'3');assert.equal(cleared.get('eventPage'),'2');
});
