import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
async function compile(path,mocks={},globals={}){
 const source=await readFile(new URL(path,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023}});
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)((id)=>{if(Object.hasOwn(mocks,id))return mocks[id];throw new Error('Unexpected dependency '+id);},module,module.exports);
 return module.exports;
}
test('collection and adjustment permissions match finance roles and settled/cancelled bills',async()=>{
 const {canAdjustTuition,canCollect}=await compile('../src/utils/finance.ts');
 assert.equal(canAdjustTuition('STAFF'),false);assert.equal(canAdjustTuition('TEACHER'),false);
 assert.equal(canAdjustTuition('ADMIN'),true);assert.equal(canAdjustTuition('SUPER_ADMIN'),true);
 assert.equal(canCollect({status:'PARTIAL',balance:10,currency:'VND'}),true);
 assert.equal(canCollect({status:'PAID',balance:0,currency:'VND'}),false);
 assert.equal(canCollect({status:'CANCELLED',balance:10,currency:'VND'}),false);
 assert.equal(canCollect({status:'UNPAID',balance:10,currency:'USD'}),false);
});
test('money validation rejects overcollection and unsupported precision without rounding down a request',async()=>{
 const {validateCollection,validMoney}=await compile('../src/utils/finance.ts');
 for(const value of [NaN,Infinity,-1,0,0.001,1.00001,null,'100'])assert.throws(()=>validateCollection(value,100));
 assert.doesNotThrow(()=>validateCollection(99.99,100));assert.doesNotThrow(()=>validateCollection(0.01,0.01));
 assert.throws(()=>validateCollection(100.01,100));assert.equal(validMoney(10000000000000),false);
});
test('discount adjustment allows a credit without altering collections',async()=>{
 const {adjustedNet}=await compile('../src/utils/finance.ts');
 assert.equal(adjustedNet(1000,200,400),800);
 assert.equal(adjustedNet(0.3,0.2,0.1),0.1);
 assert.throws(()=>adjustedNet(100,101,0));assert.equal(adjustedNet(100,50,60),50);
 assert.equal(adjustedNet(100,100,0),0);
});
function storage(){const items=new Map();return {getItem:k=>items.get(k)??null,setItem:(k,v)=>items.set(k,v),removeItem:k=>items.delete(k)};}
const draft=()=>({accountId:7,branchId:11,studentName:'Learner',className:'Class',createdAt:'2026-11-04T00:00:00Z',request:{tuitionId:1,amount:300,paymentMethod:'BANK_TRANSFER',referenceCode:'REF',note:'First',requestKey:'stable-key'}});
test('pending request survives reload, remains account scoped and rejects changed payload',async()=>{
 const localStorage=storage(),window=new EventTarget();
 const globals={localStorage,window,Event};
 const first=await compile('../src/utils/pendingPayment.ts',{},globals);
 const d=draft();first.savePending(d);
 const afterReload=await compile('../src/utils/pendingPayment.ts',{},globals);
 assert.equal(afterReload.parsePending(afterReload.pendingSnapshot(7)).request.requestKey,'stable-key');
 assert.equal(afterReload.pendingSnapshot(8),null);
 assert.throws(()=>afterReload.savePending({...d,request:{...d.request,amount:200}}));
 assert.throws(()=>afterReload.savePending({...d,request:{...d.request,requestKey:'new-key'}}));
 afterReload.clearPending(7,'different-key');
 assert.notEqual(afterReload.pendingSnapshot(7),null);
 afterReload.clearPending(7,'stable-key');assert.equal(afterReload.pendingSnapshot(7),null);
});
test('pending recovery updates outcome without changing identifiers; subscribers are cleaned up',async()=>{
 const localStorage=storage(),window=new EventTarget();
 const p=await compile('../src/utils/pendingPayment.ts',{},{localStorage,window,Event});
 let updates=0;const unsubscribe=p.subscribePending(()=>updates++);
 const d=draft();p.savePending(d);p.savePending({...d,rejected:true,error:'balance changed'});
 assert.equal(updates,2);assert.equal(p.parsePending(p.pendingSnapshot(7)).rejected,true);
 unsubscribe();p.clearPending(7,'stable-key');assert.equal(updates,2);
 assert.throws(()=>p.parsePending('{"request":{}}'));
});
test('payment retry uses exact original payload while no follow-up read changes POST outcome',async()=>{
 const calls=[],request=draft().request;
 const {paymentService}=await compile('../src/services/financeService.ts',{'../api/axiosInstance':{api:{post:async(url,data)=>{calls.push({url,data});return {data:{id:99,tuitionId:1,amount:300}};}}}});
 await paymentService.create(request);await paymentService.create(request);
 assert.equal(calls.length,2);assert.equal(calls[0].url,'/finance/payments');
 assert.equal(calls[0].data,calls[1].data);assert.equal(calls[1].data.requestKey,'stable-key');
});
