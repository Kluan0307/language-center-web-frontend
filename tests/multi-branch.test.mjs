import assert from 'node:assert/strict';
import test from 'node:test';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import ts from 'typescript';
async function load(file,globals={},mocks={}){const source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023}});const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)(id=>{if(id in mocks)return mocks[id];throw Error(id)},module,module.exports);return module.exports;}
test('admin can manage a shared account only when all assignments are under its authority',async()=>{
 const {canManageAccount}=await load('utils/accountPermissions.ts');const caller={accountId:1,role:'ADMIN',branchId:11,branchIds:[11,12]};
 assert.equal(canManageAccount(caller,{accountId:2,role:'TEACHER',branchId:12,branchIds:[12]}),true);
 assert.equal(canManageAccount(caller,{accountId:2,role:'TEACHER',branchId:11,branchIds:[11,13]}),false);
 assert.equal(canManageAccount(caller,{accountId:2,role:'ADMIN',branchId:11,branchIds:[11]}),false);
});
test('branch selection is per account and falls back after assignment revocation',async()=>{
 let accountId=1;const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const scope=await load('utils/branchScope.ts',{atob,sessionStorage:storage},{'./authStorage':{getSessionToken:()=> 'x.'+Buffer.from(JSON.stringify({accountId})).toString('base64url')+'.y'}});
 let count=0;const stop=scope.subscribeBranch(()=>count++);
 scope.ensureBranch({role:'ADMIN',branchId:11,branchIds:[11,12]});assert.equal(scope.getActiveBranch(),11);
 scope.selectBranch(12);assert.equal(scope.getActiveBranch(),12);
 accountId=2;assert.equal(scope.getActiveBranch(),null);scope.ensureBranch({role:'STAFF',branchId:13,branchIds:[13]});
 accountId=1;assert.equal(scope.getActiveBranch(),12);scope.ensureBranch({role:'ADMIN',branchId:11,branchIds:[11]});assert.equal(scope.getActiveBranch(),11);
 scope.ensureBranch({role:'SUPER_ADMIN',branchId:null,branchIds:[]});assert.equal(scope.getActiveBranch(),null);assert.ok(count>=5);stop();
});
