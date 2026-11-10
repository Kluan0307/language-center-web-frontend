import assert from 'node:assert/strict';import test from 'node:test';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
async function load(file,mocks={},globals={}){let source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');source=source.replace('import.meta.env.VITE_API_BASE_URL',"'http://localhost:8080/api/v1'");const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023,jsx:ts.JsxEmit.ReactJSX}});const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)(id=>id in mocks?mocks[id]:require(id),module,module.exports);return module.exports;}

function storage(){const rows=new Map();return{getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)}}
function draft(){return{accountId:7,branchId:11,tuitionId:1,kind:'CORRECTION',paymentId:2,request:{type:'REFUND',amount:100,paymentMethod:'CASH',reason:'Approved refund',version:4,requestKey:'same-refund'}}}
test('financial operation survives reload and is account scoped',async()=>{
 const localStorage=storage(),window=new EventTarget();const globals={localStorage,window,Event};const a=await load('utils/pendingFinance.ts',{},globals);a.saveFinance(draft());const b=await load('utils/pendingFinance.ts',{},globals);assert.equal(b.parseFinance(b.financeSnapshot(7)).request.requestKey,'same-refund');assert.equal(b.financeSnapshot(8),null);a.clearFinance(7,'other-key');assert.ok(a.financeSnapshot(7));a.clearFinance(7,'same-refund');assert.equal(a.financeSnapshot(7),null);
});
test('pending financial payload cannot be replaced by another amount or destination',async()=>{
 const a=await load('utils/pendingFinance.ts',{}, {localStorage:storage(),window:new EventTarget(),Event});a.saveFinance(draft());assert.throws(()=>a.saveFinance({...draft(),request:{...draft().request,amount:200}}));assert.throws(()=>a.saveFinance({...draft(),paymentId:3}));a.saveFinance(draft());assert.throws(()=>a.parseFinance('{"kind":"REFUND"}'));
});
test('financial adapters preserve immutable request key and expected version',async()=>{
 const calls=[];const api={post:async(url,data)=>{calls.push({url,data});return{data}},put:async(url,data)=>{calls.push({url,data});return{data}}};const {paymentService,tuitionService}=await load('services/financeService.ts',{'../api/axiosInstance':{api}});const d=draft();await paymentService.correct(d.paymentId,d.request);await tuitionService.adjust(1,{originalAmount:100,discountAmount:50,dueDate:'2026-11-05',reason:'Approved adjustment',version:8,requestKey:'adjust-key'});assert.equal(calls[0].url,'/finance/payments/2/corrections');assert.equal(calls[0].data.version,4);assert.equal(calls[1].data.requestKey,'adjust-key');
});
test('finance history queries require a selected record',async()=>{
 const {paymentService,tuitionService}=await load('services/financeService.ts',{'../api/axiosInstance':{api:{get(){throw Error('Unexpected query')}}}});assert.equal(await tuitionService.history({id:null}),null);assert.equal((await paymentService.corrections({id:null})).length,0);
});
