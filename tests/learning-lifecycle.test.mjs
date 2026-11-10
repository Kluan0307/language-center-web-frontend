import assert from 'node:assert/strict';import test from 'node:test';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
async function load(file,mocks={},globals={}){let source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');source=source.replace('import.meta.env.VITE_API_BASE_URL',"'http://localhost:8080/api/v1'");const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023,jsx:ts.JsxEmit.ReactJSX}});const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)(id=>id in mocks?mocks[id]:require(id),module,module.exports);return module.exports;}

test('lifecycle requests retain reason, optimistic version and expected return date',async()=>{
 const calls=[];const api={patch:async(url,data)=>{calls.push({url,data});return{data}},post:async(url,data)=>{calls.push({url,data});return{data}}};
 const {studentService,enrollmentService}=await load('services/admissionsService.ts',{'../api/axiosInstance':{api},'./academicService':{collectPages(){}}});
 await studentService.status(1,'PAUSED','Family request',3);await enrollmentService.status(2,'RESERVED','Medical leave',4,'2026-12-01');await enrollmentService.transfer(2,9,'Resume in another class',5);
 assert.deepEqual(JSON.parse(JSON.stringify(calls)),[{url:'/academic/students/1/status',data:{status:'PAUSED',reason:'Family request',version:3}},{url:'/academic/enrollments/2/status',data:{studyStatus:'RESERVED',reason:'Medical leave',version:4,expectedReturnDate:'2026-12-01'}},{url:'/academic/enrollments/2/transfer',data:{newClassId:9,reason:'Resume in another class',version:5}}]);
});
test('exam roster adapter uses exam identity and avoids requests without selection',async()=>{
 const calls=[];const api={get:async(url)=>{calls.push(url);return{data:{examId:7,frozen:true,students:[]}}}};
 const {examService}=await load('services/teachingService.ts',{'../api/axiosInstance':{api},'./academicService':{collectPages(){}}});
 assert.equal(await examService.roster({id:null}),null);assert.equal(calls.length,0);assert.equal((await examService.roster({id:7})).frozen,true);assert.equal(calls[0],'/teaching/exams/7/roster');
});
test('grade rows retain saved historic owners and dated eligible students without assuming current membership',async()=>{
 const {gradeRoster}=await load('utils/teaching.ts');const rows=gradeRoster([{id:1,fullName:'Eligible at exam date'}],[{studentId:2,studentName:'Legacy grade',score:8}]);
 assert.equal(rows.length,2);assert.equal(rows.find(r=>r.studentId===1).active,true);assert.equal(rows.find(r=>r.studentId===2).active,false);assert.equal(rows.find(r=>r.studentId===2).grade.score,8);
});
test('history adapters do not query absent student/enrollment IDs',async()=>{
 const api={get:()=>{throw Error('Unexpected request')}};const {studentService,enrollmentService}=await load('services/admissionsService.ts',{'../api/axiosInstance':{api},'./academicService':{collectPages(){}}});
 assert.equal((await studentService.history({id:null})).length,0);assert.equal(await enrollmentService.history({id:null}),null);
});
