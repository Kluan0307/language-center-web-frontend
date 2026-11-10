import assert from 'node:assert/strict';import test from 'node:test';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
async function load(file,mocks={},globals={}){let source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');source=source.replace('import.meta.env.VITE_API_BASE_URL',"'http://localhost:8080/api/v1'");const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023,jsx:ts.JsxEmit.ReactJSX}});const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)(id=>id in mocks?mocks[id]:require(id),module,module.exports);return module.exports;}
test('password validation handles legacy-length, blank and UTF-8 byte boundaries',async()=>{
 const {passwordError}=await load('utils/accountSecurity.ts',{}, {TextEncoder});
 assert.ok(passwordError('123456'));assert.ok(passwordError('        '));assert.equal(passwordError('abcdefgh'),undefined);
 assert.equal(passwordError('ệ'.repeat(24)),undefined);assert.ok(passwordError('ệ'.repeat(25)));assert.ok(passwordError('a'.repeat(73)));
});
test('temporary-password users are redirected from every business route to password change',async()=>{
 let path='/students';const Outlet=()=>null,Navigate=()=>null;
 const {ProtectedRoute}=await load('components/Common/ProtectedRoute/index.tsx',{'../../../hooks/useAuth':{useAuth:()=>({isAuthenticated:true,isLoading:false,user:{role:'STAFF',mustChangePassword:true}})},'../../../config/navigation':{isRole:role=>role==='STAFF'},'react-router-dom':{Outlet,Navigate,useLocation:()=>({pathname:path})}});
 assert.equal(ProtectedRoute({}).props.to,'/change-password');path='/change-password';assert.equal(ProtectedRoute({}).type,Outlet);
});
test('password-change-required response refreshes only the matching current session',async()=>{
 const axios=require('axios');const window=new EventTarget();let refreshed=0;window.addEventListener('language-center:refresh-session',()=>refreshed++);
 const {api}=await load('api/axiosInstance.ts',{'../utils/authStorage':{getSessionToken:()=> 'current',clearSession(){}},'../utils/branchScope':{getActiveBranch:()=>null},'../utils/accountSecurity':{PASSWORD_REFRESH_EVENT:'language-center:refresh-session'}},{window,Event});
 let code='PASSWORD_CHANGE_REQUIRED';api.defaults.adapter=async config=>{throw new axios.AxiosError('Forbidden','ERR_BAD_REQUEST',config,null,{status:403,data:{code},headers:{},statusText:'Forbidden',config});};
 await assert.rejects(api.get('/academic/students',{headers:{Authorization:'Bearer old'}}));assert.equal(refreshed,0);
 await assert.rejects(api.get('/academic/students'));assert.equal(refreshed,1);
 code='FORBIDDEN';await assert.rejects(api.get('/academic/students'));assert.equal(refreshed,1);
});
