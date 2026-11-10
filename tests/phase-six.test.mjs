import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
async function compile(path,mocks={}){
 const source=await readFile(new URL(path,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023}});
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+outputText+'\n})',{})((id)=>{if(Object.hasOwn(mocks,id))return mocks[id];throw new Error('Unexpected dependency '+id);},module,module.exports);
 return module.exports;
}
test('unavailable totals remain unknown while real empty counters produce zero',async()=>{
 const {totalCounts}=await compile('../src/utils/reports.ts');
 assert.equal(totalCounts(undefined),undefined);assert.equal(totalCounts({}),0);
 assert.equal(totalCounts({STUDYING:3,PAUSED:2}),5);
});
test('month groups sort chronologically without mutating server response',async()=>{
 const {orderedMonths}=await compile('../src/utils/reports.ts');
 const source=[{key:'2026-10',amount:3},{key:'2026-2',amount:2},{key:'2025-12',amount:1}];
 const sorted=orderedMonths(source);
 assert.equal(sorted.map(v=>v.key).join(','),'2025-12,2026-02,2026-10');
 assert.equal(source[1].key,'2026-2');assert.equal(sorted[2].amount,3);
});
test('teacher preview respects inclusive dates, weekly day, finished classes and full seven-day window',async()=>{
 const {nextSessions}=await compile('../src/utils/reports.ts');
 const classes=[{id:1,status:'ONGOING',startDate:'2026-11-04',endDate:'2026-11-04'},
 {id:2,status:'FINISHED',startDate:'2026-11-01',endDate:'2026-12-01'},
 {id:3,status:'UPCOMING',startDate:'2026-11-05',endDate:'2026-12-01'}];
 const slots=[{id:1,classId:1,dayOfWeek:'WEDNESDAY',startTime:'18:00'},{id:2,classId:2,dayOfWeek:'WEDNESDAY',startTime:'18:00'},
 {id:3,classId:3,dayOfWeek:'THURSDAY',startTime:'19:00'},{id:4,classId:99,dayOfWeek:'WEDNESDAY',startTime:'18:00'}];
 const preview=nextSessions(classes,slots,'2026-11-04');
 assert.equal(preview.length,2);assert.equal(preview[0].date,'2026-11-04');assert.equal(preview[1].date,'2026-11-05');
 assert.equal(preview.some(r=>r.schoolClass.id===2),false);
});
test('month start uses supplied business date rather than browser local timezone',async()=>{
 const {monthStart}=await compile('../src/utils/reports.ts');
 assert.equal(monthStart('2026-01-01'),'2026-01-01');assert.equal(monthStart('2026-11-30'),'2026-11-01');
});
test('CSV quotes Unicode/newlines and neutralizes spreadsheet formula cells',async()=>{
 const {csvText}=await compile('../src/utils/reports.ts');
 const csv=csvText([['TÃªn','GiÃ¡ trá»‹'],['KhÃ³a "A", B\nTiáº¿ng Viá»‡t',300000],['=SUM(1,2)','@value'],[null,0]]);
 assert.equal(csv.charCodeAt(0),0xfeff);
 assert.ok(csv.includes('"KhÃ³a ""A"", B\nTiáº¿ng Viá»‡t","300000"'));
 assert.ok(csv.includes('"\'=SUM(1,2)","\'@value"'));assert.ok(csv.endsWith('"","0"'));
});
test('report adapters preserve branch and receipt date filters while operations use their own contract',async()=>{
 const calls=[];
 const {reportService}=await compile('../src/services/reportService.ts',{'../api/axiosInstance':{api:{get:async(url,config)=>{calls.push({url,config});return {data:{}};}}}});
 await reportService.revenue({branchId:11,from:'2026-10-31',to:'2026-10-31'});
 await reportService.academic({branchId:11,groupByBranch:true});
 assert.equal(calls[0].url,'/finance/stats/overview');assert.equal(calls[0].config.params.from,calls[0].config.params.to);
 assert.equal(calls[1].url,'/academic/stats/overview');assert.equal(calls[1].config.params.groupByBranch,true);
 assert.equal('from' in calls[1].config.params,false);
});
