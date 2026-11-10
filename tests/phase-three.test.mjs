import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
async function compile(path, mocks = {}) {
 const source = await readFile(new URL(path, import.meta.url), 'utf8');
 const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } });
 const mod = { exports: {} };
 vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})', { Number })(
  (id) => { if(Object.hasOwn(mocks,id))return mocks[id];throw new Error('Unexpected dependency '+id); },mod,mod.exports);
 return mod.exports;
}
test('conversion requires contacted lead; converted and lost leads do not offer conversion',async()=>{
 const {canConvertLead}=await compile('../src/utils/admissions.ts');
 for(const status of ['NEW','LOST','CONVERTED'])assert.equal(canConvertLead(status),false);
 for(const status of ['CONTACTED','CONSULTING'])assert.equal(canConvertLead(status),true);
});
test('reserved enrollment resumes or closes; terminal history cannot reopen',async()=>{
 const {nextStudyStates}=await compile('../src/utils/admissions.ts');
 assert.deepEqual(Array.from(nextStudyStates('RESERVED')),['STUDYING','DROPPED']);
 for(const state of ['COMPLETED','DROPPED','TRANSFERRED'])assert.equal(nextStudyStates(state).length,0);
 assert.equal(nextStudyStates('STUDYING').includes('TRANSFERRED'),false);
});
test('same-class reservation blocks new billing while old terminal history permits registration',async()=>{
 const {existingClassEnrollment}=await compile('../src/utils/admissions.ts');
 const rows=[{id:1,classId:2,studyStatus:'TRANSFERRED'},{id:2,classId:3,studyStatus:'RESERVED'}];
 assert.equal(existingClassEnrollment(rows,2),undefined);
 assert.equal(existingClassEnrollment(rows,3).id,2);
 assert.equal(existingClassEnrollment(rows,undefined),undefined);
});
test('deep links reject negative, fractional and unsafe identifiers',async()=>{
 const {positiveId}=await compile('../src/utils/admissions.ts');
 for(const input of [null,'','0','-1','1.5','abc','9007199254740993'])assert.equal(positiveId(input),undefined);
 assert.equal(positiveId('12'),12);
});
test('tuition retry exposes FAILED even with successful HTTP response and uses requested enrollment',async()=>{
 const calls=[];
 const {enrollmentService}=await compile('../src/services/admissionsService.ts',{
  '../api/axiosInstance':{api:{post:async(url,data)=>{calls.push({url,data});return {data:{enrollmentId:10,status:'FAILED',error:'offline'}};}}},
  './academicService':{collectPages:()=>{throw new Error('Unexpected options load');}}
 });
 const result=await enrollmentService.retry(11);
 assert.equal(result.status,'FAILED');assert.equal(result.enrollmentId,10);
 assert.equal(calls[0].url,'/academic/enrollments/11/tuition/retry');
});
test('enrollment creation sends only student/class identifiers, transfer uses dedicated endpoint',async()=>{
 const calls=[];
 const {enrollmentService}=await compile('../src/services/admissionsService.ts',{
  '../api/axiosInstance':{api:{post:async(url,data)=>{calls.push({url,data});return {data:{id:7}};}}},
  './academicService':{collectPages:()=>{}}
 });
 await enrollmentService.create({studentId:2,classId:3});await enrollmentService.transfer(7,4);
 assert.deepEqual(calls[0],{url:'/academic/enrollments',data:{studentId:2,classId:3}});
 assert.equal(calls[1].url,'/academic/enrollments/7/transfer');assert.equal(calls[1].data.newClassId,4);
});
