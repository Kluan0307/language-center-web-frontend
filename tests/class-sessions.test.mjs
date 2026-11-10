import assert from 'node:assert/strict';import test from 'node:test';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
async function load(file,mocks={},globals={}){let source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');source=source.replace('import.meta.env.VITE_API_BASE_URL',"'http://localhost:8080/api/v1'");const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023,jsx:ts.JsxEmit.ReactJSX}});const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',globals)(id=>id in mocks?mocks[id]:require(id),module,module.exports);return module.exports;}

test('session times reject invalid clocks, equal times and overnight intervals',async()=>{
 const {validateSessionTimes}=await load('utils/sessions.ts');
 for(const [a,b] of [['08:00','08:00:00'],['08:00','07:59'],['23:00','01:00'],['24:00','25:00'],['08:99','10:00'],['8:00','09:00']])assert.throws(()=>validateSessionTimes(a,b));
 assert.throws(()=>validateSessionTimes('08:00','08:00:01'));validateSessionTimes('08:30:00','10:00');
});
test('unknown legacy teacher is not labelled substitute',async()=>{
 const {isSubstitute,attendanceLink}=await load('utils/sessions.ts');
 assert.equal(isSubstitute({teacherId:null,plannedTeacherId:2}),false);assert.equal(isSubstitute({teacherId:3,plannedTeacherId:2}),true);assert.equal(isSubstitute({teacherId:2,plannedTeacherId:2}),false);assert.equal(attendanceLink(19),'/attendance?sessionId=19');
});
test('session calendars collect every server page and retain teacher/date scope',async()=>{
 const calls=[],signal=new AbortController().signal;
 const api={get:async(url,config)=>{calls.push({url,...config});return{data:{content:[{id:config.params.page+1}],totalPages:3,number:config.params.page}};}};
 const {collectPages}=await load('services/academicService.ts',{'../api/axiosInstance':{api}});
 const {sessionService}=await load('services/sessionService.ts',{'../api/axiosInstance':{api},'./academicService':{collectPages}});
 const rows=await sessionService.all({teacherId:7,from:'2026-11-05',to:'2026-11-12'},signal);
 assert.equal(rows.length,3);assert.deepEqual(calls.map(c=>c.params.page),[0,1,2]);assert.ok(calls.every(c=>c.params.teacherId===7&&c.params.from==='2026-11-05'&&c.signal===signal));
});
test('absent session ID never sends detail, history or audit requests',async()=>{
 const {sessionService}=await load('services/sessionService.ts',{'../api/axiosInstance':{api:{get:()=>{throw Error('Unexpected request')}}},'./academicService':{collectPages(){}}});
 assert.equal(await sessionService.detail({id:null}),null);assert.equal((await sessionService.history({id:null})).length,0);assert.equal((await sessionService.attendanceChanges({id:null})).length,0);
});
