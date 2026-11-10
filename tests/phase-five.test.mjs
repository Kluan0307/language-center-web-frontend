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
test('attendance sends the full enrollment roster and clears permission outside ABSENT',async()=>{
 const {attendancePayload}=await compile('../src/utils/teaching.ts');
 const rows=[{enrollmentId:7,status:'PRESENT',hasPermission:true},{enrollmentId:8,status:'ABSENT',hasPermission:true},{enrollmentId:9,status:'LATE',hasPermission:true}];
 assert.equal(JSON.stringify(attendancePayload(rows)),JSON.stringify([{enrollmentId:7,status:'PRESENT',hasPermission:false},{enrollmentId:8,status:'ABSENT',hasPermission:true},{enrollmentId:9,status:'LATE',hasPermission:false}]));
 assert.equal(rows[0].hasPermission,true);
});
test('grade roster retains transferred students and distinguishes zero from missing scores',async()=>{
 const {gradeRoster}=await compile('../src/utils/teaching.ts');
 const rows=gradeRoster([{id:1,fullName:'Current'},{id:2,fullName:'Missing'}],[{id:10,studentId:1,studentName:'Current',score:0},{id:11,studentId:3,studentName:'Transferred',score:8}]);
 assert.equal(rows.length,3);assert.equal(rows.find(r=>r.studentId===1).grade.score,0);
 assert.equal(rows.find(r=>r.studentId===2).grade,undefined);
 assert.equal(rows.find(r=>r.studentId===3).active,false);
 assert.equal(rows.find(r=>r.studentId===3).grade.score,8);
});
test('grade correction roles and score boundaries reject blank, negative and over-max values',async()=>{
 const {validateScore,isTeachingManager}=await compile('../src/utils/teaching.ts');
 for(const v of [null,undefined,'',-1,10.01,0.001,NaN])assert.throws(()=>validateScore(v,10));
 for(const v of [0,7.25,10])assert.doesNotThrow(()=>validateScore(v,10));
 assert.equal(isTeachingManager('ADMIN'),true);assert.equal(isTeachingManager('SUPER_ADMIN'),true);assert.equal(isTeachingManager('TEACHER'),false);assert.equal(isTeachingManager('STAFF'),false);
});
test('upload validates supported extensions and exact size limits',async()=>{
 const {validateDocumentFile}=await compile('../src/utils/teaching.ts');
 assert.doesNotThrow(()=>validateDocumentFile({name:'Lesson.PDF',size:10*1024*1024}));
 assert.throws(()=>validateDocumentFile({name:'Lesson.pdf',size:0}));
 assert.throws(()=>validateDocumentFile({name:'Lesson.pdf',size:10*1024*1024+1}));
 assert.throws(()=>validateDocumentFile({name:'script.html',size:10}));
 assert.throws(()=>validateDocumentFile({name:'a'.repeat(201)+'.pdf',size:10}));
});
test('teaching loaders do not query unselected class/exam and collect all grade pages',async()=>{
 const calls=[];
 const {gradeService,examService,attendanceService}=await compile('../src/services/teachingService.ts',{
  '../api/axiosInstance':{api:{get:async(url,{params})=>{calls.push({url,params});return {data:{content:[{id:params.page+1}],totalPages:2}};}}},
  './academicService':{collectPages:async(load)=>{const a=await load(0),b=await load(1);return [...a.content,...b.content];}}
 });
 assert.equal((await gradeService.list({examId:null})).length,0);
 assert.equal((await examService.forClass({classId:null})).length,0);
 assert.equal(await attendanceService.sheet({classId:null,date:'2026-11-04'}),null);
 assert.equal(calls.length,0);
 const grades=await gradeService.list({examId:7});assert.equal(grades.length,2);
 assert.equal(calls[0].params.examId,7);assert.equal(calls[1].params.page,1);
});
test('document transfer uses multipart upload and authorized binary download',async()=>{
 const calls=[];
 const {documentService}=await compile('../src/services/teachingService.ts',{
  '../api/axiosInstance':{api:{post:async(url,body,config)=>{calls.push({url,body,config});return {data:{id:1}};},get:async(url,config)=>{calls.push({url,config});return {data:'binary'};}}},
  './academicService':{collectPages:()=>{}}
 });
 const body={file:'opaque form data'};
 await documentService.upload(body);assert.equal(calls[0].body,body);assert.equal(calls[0].config.headers['Content-Type'],undefined);
 await documentService.download(1);assert.equal(calls[1].url,'/teaching/documents/1/download');assert.equal(calls[1].config.responseType,'blob');
});
test('stage 5 pages no longer expose attendance mocks or teacher placeholders',async()=>{
 const attendance=await readFile(new URL('../src/pages/AttendanceManagement/AttendancePage.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(attendance,/from .*mock|savedSessions|localStorage/);
 const app=await readFile(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(app,/function AttendanceRoute/);
 assert.match(app,/attendance: <AttendanceManagement/);assert.match(app,/exams: <ExamManagement/);assert.match(app,/documents: <DocumentManagement/);
});
